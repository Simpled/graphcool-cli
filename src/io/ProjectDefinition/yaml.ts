import * as Ajv from 'ajv'
import { GraphcoolDefinition } from '../../definition-schema/ts-definition'
import * as anyjson from 'any-json'
import schema from '../../definition-schema/json-schema'
import * as chalk from 'chalk'

const ajv = new Ajv()

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
const validate = ajv.compile(schema)


export async function readDefinition(file: string): Promise<GraphcoolDefinition> {
  const json = await anyjson.decode(file, 'yaml')
  const valid = validate(json)
  // TODO activate as soon as the backend sends valid yaml
  if (!valid) {
    console.log(chalk.bold('Errors while validating graphcool.yml:'))
    console.error(chalk.red(ajv.errorsText(validate.errors).split(', ').map(l => `  ${l}`).join('\n')))
    process.exit(1)
  }
  return json as GraphcoolDefinition
}
