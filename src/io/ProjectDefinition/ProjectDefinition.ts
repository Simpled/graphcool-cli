// long name to avoid naming conflict with the ts type definition
import { ProjectDefinition } from '../../types'
import fsToProject from './fsToProject'
import projectToFs from './projectToFs'
import * as path from 'path'
import fs from '../fs'
import { readDefinition } from './yaml'
import out from '../Out'
import * as chalk from 'chalk'

class ProjectDefinitionClass {
  definition: ProjectDefinition | null

  public async load() {
    if (fs.existsSync(path.join(process.cwd(), 'graphcool.yml'))) {
      this.definition = await fsToProject(process.cwd())
      fs.writeFileSync('definition.json', JSON.stringify(this.definition, null, 2))
    }
  }

  public async save(files?: string[], silent?: boolean) {
    projectToFs(this.definition!, process.cwd(), files, silent)
    fs.writeFileSync('definition.json', JSON.stringify(this.definition, null, 2))
  }

  public async saveTypes() {
    const definition = await readDefinition(this.definition!.modules[0]!.content)
    const types = this.definition!.modules[0].files[definition.types]
    out.write(chalk.blue(`Written ${definition.types}`))
    fs.writeFileSync(path.join(process.cwd(), definition.types), types)
  }

  public set(definition: ProjectDefinition | null) {
    this.definition = definition
  }
}

const definition = new ProjectDefinitionClass()

export default definition
