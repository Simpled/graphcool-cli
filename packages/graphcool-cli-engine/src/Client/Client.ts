import { GraphQLClient } from 'graphql-request'
import {
  MigrateProjectPayload,
  MigrationResult,
  Project,
  ProjectDefinition,
  ProjectInfo,
  RemoteProject
} from '../types'

import { omit } from 'lodash'
import { Config } from '../Config';
import { getFastestRegion } from './ping'

import fs from '../fs'
import * as path from 'path'
import * as cuid from 'cuid'

const debug = require('debug')('graphcool')

const REMOTE_PROJECT_FRAGMENT = `
  fragment RemoteProject on Project {
    id
    name
    schema
    alias
    region
    projectDefinitionWithFileContent
  }
`

export class Client {
  client: GraphQLClient
  config: Config
  public mock: (input: {request: any, response: any}) => void

  private mocks: {[request: string]: string} = {}

  constructor(config: Config) {
    this.config = config
    this.updateClient()
  }

  updateClient() {
    const client = new GraphQLClient(this.config.systemAPIEndpoint, {
      headers: {
        Authorization: `Bearer ${this.config.token}`
      }
    })

    this.client = {
      request: (query, variables) => {
        debug(this.config.systemAPIEndpoint)
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
          const id = cuid()

          const json = JSON.stringify({
            request,
            response: data,
          }, null, 2)

          const requestPath = path.join(this.config.definitionDir, `./${id}.json`)
          fs.writeFileSync(requestPath, json)

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

    const res = await this.push(project.id, true, false, projectDefinition)

    if (res.errors && res.errors.length > 0) {
      throw new Error(res.errors.map(e => e.description).join('\n'))
    }

    // TODO set project definition, should be possibility in the addProject mutation

    return this.getProjectDefinition(project)
  }

  async push(projectId: string, force: boolean, isDryRun: boolean, config: ProjectDefinition): Promise<MigrationResult> {
    const mutation = `\
      mutation($projectId: String!, $force: Boolean, $isDryRun: Boolean!, $config: String!) {
        push(input: {
          projectId: $projectId
          force: $force
          isDryRun: $isDryRun
          config: $config
          version: 1
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
            projectDefinitionWithFileContent
          }
        }
      }
    `
    const {push} = await this.client.request<{ push: MigrateProjectPayload }>(mutation, {
      projectId,
      force,
      isDryRun,
      config: JSON.stringify(config),
    })

    debug()

    return {
      migrationMessages: push.migrationMessages,
      errors: push.errors,
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

  async checkStatus(instruction: any): Promise<any> {
    try {
      await fetch(this.config.statusEndpoint, {
        method: 'post',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(instruction),
      })
    } catch (e) {
      // noop
    }
  }

  private getProjectDefinition(project: RemoteProject): ProjectInfo {
    return {
      ...omit<Project, RemoteProject>(project, 'projectDefinitionWithFileContent'),
      projectDefinition: JSON.parse(project.projectDefinitionWithFileContent) as ProjectDefinition,
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