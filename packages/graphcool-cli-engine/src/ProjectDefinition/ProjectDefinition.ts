import fsToProject from './fsToProject'
import projectToFs from './projectToFs'
import * as path from 'path'
import { readDefinition } from './yaml'
import * as chalk from 'chalk'
import { ProjectDefinition } from '../types'
import fs from '../fs'
import { Output } from '../Output/index'
import { Config } from '../Config'


export class ProjectDefinitionClass {
  definition: ProjectDefinition | null
  out: Output
  config: Config

  constructor(out: Output, config: Config) {
    this.out = out
    this.config = config
  }

  public async load() {
    const definitionJsonPath = path.join(this.config.definitionDir, 'definition.json')
    if (fs.existsSync(path.join(this.config.definitionDir, 'graphcool.yml'))) {
      this.definition = await fsToProject(this.config.definitionDir, this.out)
      fs.writeFileSync(definitionJsonPath, JSON.stringify(this.definition, null, 2))
    }
  }

  public async save(files?: string[], silent?: boolean) {
    const definitionJsonPath = path.join(this.config.definitionDir, 'definition.json')
    projectToFs(this.definition!, this.config.definitionDir, this.out, files, silent)
    fs.writeFileSync(definitionJsonPath, JSON.stringify(this.definition, null, 2))
  }

  public async saveTypes() {
    const definition = await readDefinition(this.definition!.modules[0]!.content, this.out)
    const types = this.definition!.modules[0].files[definition.types]
    this.out.log(chalk.blue(`Written ${definition.types}`))
    fs.writeFileSync(path.join(this.config.definitionDir, definition.types), types)
  }

  public set(definition: ProjectDefinition | null) {
    this.definition = definition
  }
}