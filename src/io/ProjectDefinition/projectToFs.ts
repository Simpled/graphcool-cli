import * as path from 'path'
import { GraphcoolModule, ProjectDefinition } from '../../types'
import * as mkdirp from 'mkdirp'
import * as chalk from 'chalk'
import out from '../Out'
import fs from '../fs'
require('source-map-support/register')

export default async function projectToFs(project: ProjectDefinition, outputDir: string, files?: string[], silent?: boolean): Promise<any> {
  for (const module of project.modules) {
    await moduleToFs(module, outputDir, files, silent)
  }
}

async function moduleToFs(module: GraphcoolModule, outputDir: string, files?: string[], silent?: boolean) {
  if (!silent) {
    out.write('\n')
  }
  if ((files && files.includes('graphcool.yml') || !files)) {
    const ymlPath = path.join(outputDir, 'graphcool.yml')
    fs.writeFileSync(ymlPath, module.content)
    if (!silent) {
      out.write(chalk.bold(`\nWritten to graphcool.yml`))
    }
  }

  const fileNames = files ? Object.keys(module.files).filter(f => files.includes(f)) : Object.keys(module.files)

  for (const relativePath of fileNames) {
    const content = module.files[relativePath]
    const filePath = path.join(outputDir, relativePath)
    const dir = path.dirname(filePath)

    let currentFile: null | string = null

    try {
      currentFile = fs.readFileSync(filePath, 'utf-8')
    } catch (e) {
      // ignore if file doesn't exist yet
    }

    mkdirp.sync(dir, {fs})
    fs.writeFileSync(filePath, content)
    if (!silent) {
      out.write(chalk.bold(`\nWritten to ${relativePath}\n`))
    }
  }
}
