// long name to avoid naming conflict with the ts type definition
import { ProjectDefinition } from '../../types'
import fsToProject from './fsToProject'
import projectToFs from './projectToFs'
import * as fs from 'fs'
import * as path from 'path'

class ProjectDefinitionClass {
  definition: ProjectDefinition

  public async load() {
    this.definition = await fsToProject(process.cwd())
  }

  public async save() {
    await projectToFs(this.definition, process.cwd())
  }

  public set(definition: ProjectDefinition) {
    this.definition = definition
  }
}


const definition = new ProjectDefinitionClass()
if (fs.existsSync(path.join(process.cwd(), 'graphcool.yml'))) {
  // definition.load()
}

export default definition
