import * as path from 'path'
import * as fs from 'fs'
import { GraphcoolModule, ProjectDefinition } from '../../types'
import * as mkdirp from 'mkdirp'

export default async function projectToFs(project: ProjectDefinition, outputDir: string): Promise<any> {
  for (const module of project.modules) {
    await moduleToFs(module, outputDir)
  }
}

async function moduleToFs(module: GraphcoolModule, outputDir: string) {
  const ymlPath = path.join(outputDir, 'graphcool.yml')
  fs.writeFileSync(ymlPath, module.content)
  console.log(`Written to ${ymlPath}`)

  for (const relativePath in module.files) {
    const content = module.files[relativePath]
    const filePath = path.join(outputDir, relativePath)
    const dir = path.dirname(filePath)

    let currentFile: null | string = null

    try {
      currentFile = fs.readFileSync(filePath, 'utf-8')
    } catch (e) {
      // ignore if file doesn't exist yet
    }

    mkdirp.sync(dir)
    fs.writeFileSync(filePath, content)
    console.log(`Written to ${filePath}`)
  }
}
