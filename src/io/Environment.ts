import * as fs from 'fs'
import * as yaml from 'js-yaml'
import { EnvironmentConfig, Environments, ProjectEnvironment } from '../types'
import * as path from 'path'
import client from './Client'
import { envDoesntExist, noDefaultEnvironmentProvidedMessage } from '../utils/constants'

const envPath = path.join(process.cwd(), '.graphcool.env')

class Environment {
  env: EnvironmentConfig

  private initEmptyEnvironment() {
    this.env = {
      default: null,
      environments: {}
    }
  }

  get default(): ProjectEnvironment | null {
    if (this.env.default) {
      return this.env.environments[this.env.default]
    }

    return null
  }

  public load() {
    if (fs.existsSync(envPath)) {
      this.env = yaml.safeLoad(fs.readFileSync(envPath, 'utf-8'))
    } else {
      this.initEmptyEnvironment()
    }
  }

  public save() {
    const file = yaml.safeDump(this.env)
    fs.writeFileSync(envPath, file)
  }

  public setEnv(name: string, projectEnv: ProjectEnvironment) {
    this.env.environments[name] = projectEnv
  }

  public async set(name: string, projectId: string) {
    const version = await client.getProjectVersion(projectId)

    this.env.environments[name] = {
      projectId,
      version,
    }
  }

  public setVersion(name: string, version: number) {
    this.env.environments[name] = {
      projectId: this.env.environments[name].projectId,
      version,
    }
  }

  public setDefault(name: string) {
    this.env.default = name
  }

  public rename(oldName: string, newName: string) {
    const oldEnv = this.env.environments[oldName]

    if (!oldEnv) {
      throw new Error(`Environment ${oldName} doesn't exist`)
    }

    delete this.env.environments[oldName]
    if (this.env.default === oldName) {
      this.setDefault(newName)
    }
    this.env.environments[newName] = oldEnv
  }

  public remove(envName: string) {
    const oldEnv = this.env.environments[envName]

    if (!oldEnv) {
      throw new Error(`Environment ${envName} doesn't exist`)
    }

    delete this.env.environments[envName]
  }

  public async getProjectId({project, env, skipDefault}: {project?: string, env?: string, skipDefault?: boolean}): Promise<string | null> {
    if (project) {
      const projects = await client.fetchProjects()
      const foundProject = projects.find(p => p.id === project || p.alias === project)
      if (!foundProject) {
        throw new Error(`Project with alias or id "${project}" could not be found in this account`)
      }
      return foundProject.id
    }

    if (env) {
      const environment = this.env.environments[env]

      if (!environment) {
        throw new Error(envDoesntExist(env))
      }

      return environment.projectId
    }

    if (this.default && !skipDefault) {
      return this.default.projectId
    }

    return null
  }

  public getEnvironment(projectId: string): {projectEnvironment: ProjectEnvironment, envName: string} | null {
    const envName = Object.keys(this.env.environments).find(key => {
      const projectEnv = this.env.environments[key]
      return projectEnv.projectId === projectId
    })

    if (envName) {
      return {
        projectEnvironment: this.env.environments[envName],
        envName,
      }
    }

    return null
  }

}

const env = new Environment()
env.load()

export default env