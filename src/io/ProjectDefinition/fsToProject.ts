import * as path from 'path'
import * as fs from 'fs'
import { ProjectDefinition, GraphcoolModule } from '../../types'
import { readDefinition } from './yaml'
import { FunctionDefinition, GraphcoolDefinition } from '../../definition-schema/ts-definition'

export default async function fsToProject(inputDir: string): Promise<ProjectDefinition> {

  const content = fs.readFileSync(path.join(inputDir, 'graphcool.yml'), 'utf-8')

  let module: GraphcoolModule = {
    name: '',
    content,
    files: {}
  }

  let files = {}

  const definition: GraphcoolDefinition = await readDefinition(content)

  const databaseSchema = fs.readFileSync(path.join(inputDir, definition.types), 'utf-8')
  files = {
    ...files,
    [definition.types]: databaseSchema,
  }

  if (definition.permissions) {
    definition.permissions.forEach(modelPermission => {
      if (modelPermission.query) {
        const permissionQuery = fs.readFileSync(path.join(inputDir, modelPermission.query.src), 'utf-8')
        files = {
          ...files,
          [modelPermission.query.src]: permissionQuery,
        }
      }
    })
  }

  if (definition.functions) {
    Object.keys(definition.functions).forEach(funcName => {
      const func: FunctionDefinition = definition.functions[funcName]
      if (func.handler.code) {
        const functionCode = fs.readFileSync(path.join(inputDir, func.handler.code.src), 'utf-8')
        files = {
          ...files,
          [func.handler.code.src]: functionCode,
        }
      }

      if (func.serversideSubscription) {
        if (func.serversideSubscription.subscriptionQuery) {
          const file = fs.readFileSync(path.join(inputDir, func.serversideSubscription.subscriptionQuery.src), 'utf-8')
          files = {
            ...files,
            [func.serversideSubscription.subscriptionQuery.src]: file,
          }
        }

        if (func.serversideSubscription.schemaExtension) {
          const file = fs.readFileSync(path.join(inputDir, func.serversideSubscription.schemaExtension.src), 'utf-8')
          files = {
            ...files,
            [func.serversideSubscription.schemaExtension.src]: file,
          }
        }
      }

    })
  }

  return {
    modules: [{
      ...module,
      files,
    }]
  }
}
