// long name to avoid naming conflict with the ts type definition
import { ProjectDefinition } from '../../types'
import fsToProject from './fsToProject'
import projectToFs from './projectToFs'
import * as fs from 'fs'
import * as path from 'path'

class ProjectDefinitionClass {
  definition: ProjectDefinition

  public async load() {
    if (fs.existsSync(path.join(process.cwd(), 'graphcool.yml'))) {
      this.definition = await fsToProject(process.cwd())
    }
  }

  public async save(files?: string[], silent?: boolean) {
    await projectToFs(this.definition, process.cwd(), files, silent)
  }

  public set(definition: ProjectDefinition) {
    this.definition = definition
  }
}

const definition = new ProjectDefinitionClass()

export default definition
