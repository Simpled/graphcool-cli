import * as Ajv from 'ajv'
import { GraphcoolDefinition } from '../../definition-schema/gcl-types'
import * as anyjson from 'any-json'
import schema from '../../definition-schema/json-schema'

const ajv = new Ajv()

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
const validate = ajv.compile(schema)


export async function readDefinition(file: string): Promise<GraphcoolDefinition> {
  const json = await anyjson.decode(file, 'yaml')
  const valid = validate(json)
  // TODO activate as soon as the backend sends valid yaml
  // if (!valid) {
  //   console.log(validate.errors)
  //   throw ajv.errorsText(validate.errors)
  // }
  return json as GraphcoolDefinition
}
