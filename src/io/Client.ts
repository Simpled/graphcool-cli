import { GraphQLClient } from 'graphql-request'
import { statusEndpoint, systemAPIEndpoint } from '../utils/constants'
import {
  CommandInstruction,
  MigrateProjectPayload,
  MigrationResult,
  Project,
  ProjectDefinition,
  ProjectInfo,
  RemoteProject
} from '../types'
import { getFastestRegion } from '../utils/ping'
import { omit } from 'lodash'
import config from './GraphcoolRC'
import * as cuid from 'cuid'
import * as path from 'path'
import fs from './fs'

const debug = require('debug')('graphcool')


const REMOTE_PROJECT_FRAGMENT = `
  fragment RemoteProject on Project {
    id
    name
    schema
    alias
    version
    region
    projectDefinitionWithFileContent
  }
`

class Client {
  client: GraphQLClient

  constructor() {
    this.updateClient()
  }

  public mock: (input: {request: any, response: any}) => void
  private mocks: {[request: string]: string} = {}

  updateClient() {
    const client = new GraphQLClient(systemAPIEndpoint, {
      headers: {
        Authorization: `Bearer ${config.token}`
      }
    })

    this.client = {
      request: (query, variables) => {
        debug(query)
        debug(variables)
        const request = JSON.stringify({
          query,
          variables: variables ? variables : undefined,
        }, null, 2)
        if (this.mocks[request]) {
          return Promise.resolve(this.mocks[request])
        }
        return client.request(query, variables).then(data => {
          // TODO remove when not needed anymore
          // const id = cuid()
          // const requestPath = path.join(process.cwd(), `./${id}-request.json`)
          // fs.writeFileSync(requestPath, request)
          // const responsePath = path.join(process.cwd(), `./${id}-response.json`)
          // fs.writeFileSync(responsePath, JSON.stringify(data, null, 2))
          // if (process.env.NODE_ENV === 'test') {
          //   throw new Error(`Error, performed not mocked request. Saved under ${id}`)
          // }
          return data
        })
      }
    } as any
  }

  async createProject(name: string, projectDefinition: ProjectDefinition, alias?: string, region?: string): Promise<ProjectInfo> {
    const mutation = `\
      mutation addProject($name: String!, $alias: String, $region: Region) {
        addProject(input: {
          name: $name,
          alias: $alias,
          region: $region,
          clientMutationId: "static"
        }) {
          project {
            ...RemoteProject
          }
        }
      }
      ${REMOTE_PROJECT_FRAGMENT}
      `

    // gather variables
    let variables: any = {name}
    if (alias) {
      variables = {...variables, alias}
    }
    if (region) {
      variables = {...variables, region: region.toUpperCase()}
    } else {
      const fastestRegion = await getFastestRegion()
      variables = {...variables, region: fastestRegion.toUpperCase()}
    }

    const {addProject: {project}} = await this.client.request<{ addProject: { project: RemoteProject } }>(mutation, variables)
    // TODO rm this as soon as the backend has fixed this
    // push schema only
    const tempDefinition: ProjectDefinition = JSON.parse(project.projectDefinitionWithFileContent)
    tempDefinition.modules[0].files['./types.graphql'] = projectDefinition.modules[0].files['./types.graphql']
    const res1 = await this.push(project.id, true, false, project.version, tempDefinition)

    const res2 = await this.push(project.id, true, false, res1.newVersion, projectDefinition)

    if (res1.errors && res1.errors.length > 0) {
      throw new Error(res1.errors.map(e => e.description).join('\n'))
    }

    // TODO set project definition, should be possibility in the addProject mutation

    return this.getProjectDefinition(project)
  }

  private getProjectDefinition(project: RemoteProject): ProjectInfo {
    return {
      ...omit<Project, RemoteProject>(project, 'projectDefinitionWithFileContent'),
      projectDefinition: JSON.parse(project.projectDefinitionWithFileContent) as ProjectDefinition,
    }
  }

  async migrateProject(newSchema: string, force: boolean, isDryRun: boolean): Promise<MigrationResult> {
    const mutation = `\
      mutation($newSchema: String!, $force: Boolean!, $isDryRun: Boolean!) {
        migrateProject(input: {
          newSchema: $newSchema,
          force: $force,
          isDryRun: $isDryRun
        }) {
          migrationMessages {
            type
            action
            name
            description
            subDescriptions {
              type
              action
              name
              description
            }
          }
          errors {
            description
            type
            field
          }
          project {
            id
            name
            schema
            alias
            version
            projectDefinitionWithFileContent
          }
        }
      }
    `
    const {migrateProject} = await this.client.request<{ migrateProject: MigrateProjectPayload }>(mutation, {
      newSchema,
      force,
      isDryRun
    })

    return {
      migrationMessages: migrateProject.migrationMessages,
      errors: migrateProject.errors,
      newVersion: migrateProject.project.version,
      newSchema: migrateProject.project.schema,
      projectDefinition: this.getProjectDefinition(migrateProject.project as any).projectDefinition,
    }
  }

  async push(projectId: string, force: boolean, isDryRun: boolean, version: number, config: ProjectDefinition): Promise<MigrationResult> {
    const mutation = `\
      mutation($projectId: String!, $force: Boolean, $isDryRun: Boolean!, $version: Int!, $config: String!) {
        push(input: {
          projectId: $projectId
          force: $force
          isDryRun: $isDryRun
          version: $version
          config: $config
        }) {
          migrationMessages {
            type
            action
            name
            description
            subDescriptions {
              type
              action
              name
              description
            }
          }
          errors {
            description
            type
            field
          }
          project {
            id
            name
            alias
            version
            projectDefinitionWithFileContent
          }
        }
      }
    `
    const {push} = await this.client.request<{ push: MigrateProjectPayload }>(mutation, {
      projectId,
      force,
      isDryRun,
      version,
      config: JSON.stringify(config),
    })

    debug()

    return {
      migrationMessages: push.migrationMessages,
      errors: push.errors,
      newVersion: push.project.version,
      newSchema: push.project.schema,
      projectDefinition: this.getProjectDefinition(push.project as any).projectDefinition,
    }
  }

  async fetchProjects(): Promise<Project[]> {
    interface ProjectsPayload {
      viewer: {
        user: {
          projects: {
            edges: Array<{
              node: ProjectInfo
            }>
          }
        }
      }
    }

    const result = await this.client.request<ProjectsPayload>(`
      {
        viewer {
          user {
            projects {
              edges {
                node {
                  id
                  name
                  alias
                  version
                  region
                }
              }
            }
          }
        }
      }`)

    return result.viewer.user.projects.edges.map(edge => edge.node)
  }

  async fetchProjectInfo(projectId: string): Promise<ProjectInfo> {
    interface ProjectInfoPayload {
      viewer: {
        project: RemoteProject
      }
    }

    const {viewer: {project}} = await this.client.request<ProjectInfoPayload>(`
      query ($projectId: ID!){
        viewer {
          project(id: $projectId) {
            ...RemoteProject
          }
        }
      }
      ${REMOTE_PROJECT_FRAGMENT}
      `, {projectId})

    return this.getProjectDefinition(project)
  }

  async getProjectVersion(projectId: string): Promise<number> {
    interface ProjectInfoPayload {
      viewer: {
        project: {
          version: number
        }
      }
    }

    const {viewer: {project}} = await this.client.request<ProjectInfoPayload>(`
      query ($projectId: ID!){
        viewer {
          project(id: $projectId) {
            version
          }
        }
      }
      `, {projectId})

    return project.version
  }

  async getProjectName(projectId: string): Promise<string> {
    interface ProjectInfoPayload {
      viewer: {
        project: {
          name: string
        }
      }
    }

    const {viewer: {project}} = await this.client.request<ProjectInfoPayload>(`
      query ($projectId: ID!){
        viewer {
          project(id: $projectId) {
            name
          }
        }
      }
      `, {projectId})

    return project.name
  }

  async deleteProjects(projectIds: string[]): Promise<string[]> {
    const inputArguments = projectIds.reduce((prev, current, index) => {
      return `${prev}$projectId${index}: String!${index < (projectIds.length - 1) ? ', ' : ''}`
    }, '')
    const singleMutations = projectIds.map((projectId, index) => `
      ${projectId}: deleteProject(input:{
          projectId: $projectId${index},
          clientMutationId: "asd"
        }) {
          deletedId
      }`)

    const header = `mutation (${inputArguments}) `
    const body = singleMutations.join('\n')
    const mutation = `${header} { \n${body} \n}`
    const variables = projectIds.reduce((prev, current, index) => {
      prev[`projectId${index}`] = current
      return prev
    }, {})

    interface DeletePayload {
      [projectId: string]: {
        deletedId: string
      }
    }

    const result = await this.client.request<DeletePayload>(mutation, variables)

    return Object.keys(result).map(projectId => result[projectId].deletedId)
  }

  async exportProjectData(projectId: string): Promise<string> {
    interface ExportPayload {
      exportData: {
        url: string
      }
    }

    const {exportData} = await this.client.request<ExportPayload>(`
      mutation ($projectId: String!){
        exportData(input:{
          projectId: $projectId,
          clientMutationId: "asd"
        }) {
          url
        }
      }
    `, {projectId})

    return exportData.url
  }

  async cloneProject(variables: {
    projectId: string,
    name: string,
    includeMutationCallbacks: boolean,
    includeData: boolean,
  }): Promise<ProjectInfo> {

    interface CloneProjectPayload {
      project: RemoteProject
    }

    const {project} = await this.client.request<CloneProjectPayload>(`
      mutation ($projectId: String!, $name: String!, $includeMutationCallbacks: Boolean!, $includeData: Boolean!){
        cloneProject(input:{
          name: $name,
          projectId: $projectId,
          includeData: $includeData,
          includeMutationCallbacks: $includeMutationCallbacks,
          clientMutationId: "asd"
        }) {
          project {
            ...RemoteProject
          }
        }
      }
      ${REMOTE_PROJECT_FRAGMENT}
    `)

    return this.getProjectDefinition(project)
  }

  async checkStatus(instruction: CommandInstruction): Promise<any> {
    try {
      await fetch(statusEndpoint, {
        method: 'post',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(instruction),
      })
    } catch (e) {
      // noop
    }
  }
}

// only make this available in test mode
if (process.env.NODE_ENV === 'test') {
  Client.prototype.mock = function({request, response}) {
    if (!this.mocks) {
      this.mocks = {}
    }
    this.mocks[JSON.stringify(request, null, 2)] = response
  }
}

const client = new Client()

export default client
