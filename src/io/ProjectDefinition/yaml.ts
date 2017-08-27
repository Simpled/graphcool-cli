import * as Ajv from 'ajv'
import { GraphcoolDefinition } from '../../gcl-types'
import * as anyjson from 'any-json'
import schema from './json-schema'

const ajv = new Ajv()

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
const validate = ajv.compile(schema)


export async function readDefinition(file: string): Promise<GraphcoolDefinition> {
  const json = await anyjson.decode(file, 'yaml')
  validate(json)
  return json as GraphcoolDefinition
}
