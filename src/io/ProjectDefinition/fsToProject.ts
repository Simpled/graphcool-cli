import * as path from 'path'
import * as fs from 'fs'
import * as chalk from 'chalk'
import { ProjectDefinition, GraphcoolModule } from '../../types'
import { readDefinition } from './yaml'
import { FunctionDefinition, GraphcoolDefinition } from '../../definition-schema/ts-definition'

interface ErrorMessage {
  message: string
}

export default async function fsToProject(inputDir: string): Promise<ProjectDefinition> {

  const content = fs.readFileSync(path.join(inputDir, 'graphcool.yml'), 'utf-8')

  let module: GraphcoolModule = {
    name: '',
    content,
    files: {}
  }

  let files = {}
  let errors: ErrorMessage[] = []

  const definition: GraphcoolDefinition = await readDefinition(content)
  const typesPath = path.join(inputDir, definition.types)

  if (fs.existsSync(typesPath)) {
    const types = fs.readFileSync(typesPath, 'utf-8')
    files = {
      ...files,
      [definition.types]: types,
    }
  } else {
    errors.push({
      message: `The types definition file "${typesPath}" could not be found.`,
    })
  }

  if (definition.permissions) {
    definition.permissions.forEach(permission => {

      if (permission.query && isGraphQLFile(permission.query)) {
        const queryPath = path.join(inputDir, permission.query)
        if (fs.existsSync(queryPath)) {
          const permissionQuery = fs.readFileSync(queryPath, 'utf-8')
          files = {
            ...files,
            [permission.query]: permissionQuery,
          }
        } else {
          errors.push({
            message: `The file ${permission.query} for permission query ${permission.operation} does not exist`,
          })
        }
      }
    })
  }

  if (definition.functions) {
    Object.keys(definition.functions).forEach(funcName => {
      const func: FunctionDefinition = definition.functions[funcName]
      if (func.handler.code && func.handler.code.src) {
        if (!isFunctionFile(func.handler.code.src)) {
          errors.push({
            message: `The handler ${func.handler.code.src} for function ${funcName} is not a valid function path. It must end with .js and be in the current working directory.`
          })
        }
        const handlerPath = path.join(inputDir, func.handler.code.src)
        if (fs.existsSync(handlerPath)) {
          const functionCode = fs.readFileSync(handlerPath, 'utf-8')
          files = {
            ...files,
            [func.handler.code.src]: functionCode,
          }
        } else {
          errors.push({
            message: `The file ${func.handler.code.src} for function ${funcName} does not exist`,
          })
        }
      }

      if (func.query && isGraphQLFile(func.query)) {
        const queryPath = path.join(inputDir, func.query)

        if (fs.existsSync(queryPath)) {
          const file = fs.readFileSync(queryPath, 'utf-8')
          files = {
            ...files,
            [func.query]: file,
          }
        } else {
          errors.push({
            message: `The file ${func.handler} for the subscription query of function ${funcName} does not exist`,
          })
        }
      }

      if (func.schema && isGraphQLFile(func.schema)) {
        const queryPath = path.join(inputDir, func.schema)

        if (fs.existsSync(queryPath)) {
          const file = fs.readFileSync(queryPath, 'utf-8')
          files = {
            ...files,
            [func.schema]: file,
          }
        } else {
          errors.push({
            message: `The file ${func.handler} for the schema extension of function ${funcName} does not exist`,
          })
        }
      }
    })
  }

  if (errors.length > 0) {
    console.log(chalk.bold('The following errors occured while reading the graphcool.yml project definition:'))
    const messages = errors.map(e => `  ${chalk.red(e.message)}`).join('\n')
    console.log(messages + '\n')
    process.exit(1)
  }

  return {
    modules: [{
      ...module,
      files,
    }]
  }
}

function isFile(type) {
  return content => {
    return new RegExp(`\.${type}$`).test(content) && !content.startsWith('../')
  }
}

const isGraphQLFile = isFile('graphql')
const isFunctionFile = isFile('js')
