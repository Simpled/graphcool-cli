export interface GraphcoolDefinition {
  types: string
  permissions: Array<ModelPermission | RelationPermission>
  functions: FunctionDefinition[]
  rootTokens: PermanentAuthToken[]
}

export interface ModelPermission {
  description: string
  isEnabled: boolean
  operation: string
  authenticated: boolean
  query?: Query
  fields: string[]
}

export interface Query {
  src: string
}

export interface RelationPermission {
  isEnabled: boolean
  relation: string
  connect: boolean
  disconnect: boolean
  authenticated: boolean
  query?: Query
}

export interface FunctionDefinition {
  name: string
  isEnabled: boolean
  handler: FunctionHandler
  type: FunctionType
  operation?: string
  query?: string
  schema?: string
}

export type FunctionHandler = FunctionHandlerWebhook | string

export interface FunctionHandlerWebhook {
  webhook?: FunctionHandlerWebhookSource
}
export type FunctionHandlerWebhookSource = string | FunctionHandlerWebhookWithHeaders

export interface FunctionHandlerWebhookWithHeaders {
  url: string
  headers: Header[]
}

export interface Header {
  name: string
  value: string
}

export type FunctionType = 'operationBefore' | 'operationAfter' | 'subscription' | 'httpRequest' | 'httpResponse'
