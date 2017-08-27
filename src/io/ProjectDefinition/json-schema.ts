export default {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "JSON schema for Graphcool project.yml files",
  "definitions": {
    "function": {
      "description": "A piece of code that you should run.",
      "type": "object",
      "properties": {
        "isEnabled": {
          "type": "boolean",
          "default": true
        },
        "handler": {
          "oneOf": [
            {
              "type": "string"
            },
            {
              "type": "object",
              "additionalProperties": false,
              "minProperties": 1,
              "properties": {
                "webhook": {
                  "oneOf": [
                    {
                      "type": "string"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "url": {
                          "type": "string"
                        },
                        "headers": {
                          "type": "object"
                        }
                      },
                      "required": [
                        "url"
                      ]
                    }
                  ]
                }
              }
            }
          ]
        },
        "type": {
          "oneOf": [
            {
              "type": "string",
              "enum": [
                "httpRequest",
                "httpResponse"
              ]
            },
            {
              "type": "object",
              "additionalProperties": false,
              "minProperties": 1,
              "properties": {
                "operationBefore": {
                  "type": "string",
                  // (modelName.(create|update|delete) | relationName.(connect|disconnect))
                  "pattern": "^[A-Z][a-zA-Z]*\\.(create|update|delete|connect|disconnect|\\*)$"
                }
              }
            },
            {
              "type": "object",
              "additionalProperties": false,
              "minProperties": 1,
              "properties": {
                "operationAfter": {
                  "type": "string",
                  // (modelName.(create|update|delete) | relationName.(connect|disconnect))
                  "pattern": "^[A-Z][a-zA-Z]*\\.(create|update|delete|connect|disconnect|\\*)$"
                }
              }
            },
            {
              "type": "object",
              "additionalProperties": false,
              "minProperties": 1,
              "properties": {
                "subscription": {
                  "type": "string"
                }
              }
            },
            {
              "type": "object",
              "additionalProperties": false,
              "minProperties": 1,
              "properties": {
                "schemaExtension": {
                  "type": "string"
                }
              }
            }
          ]
        }
      },
      "required": [
        "type",
        "handler"
      ]
    },
    "permission": {
      "description": "A permission so you can do stuff or don't",
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          // (modelName.(create|read|list|update|delete) | relationName.(connect|disconnect))
          "pattern": "^[A-Z][a-zA-Z]*\\.(create|update|delete|read|list|connect|disconnect|\\*)$"
        },
        "authenticated": {
          "type": "boolean",
          "default": false
        },
        "query": {
          "type": "string"
        },
        "fields": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": [
        "operation"
      ]
    }
  },
  "properties": {
    "types": {
      "description": "Type definitions for database models, relations, enums and other types",
      "type": [
        "string",
        "array"
      ],
      "items": {
        "type": "string"
      }
    },
    "rootTokens": {
      "description": "List of tokens that provide root access (Use \`graphcool get-root-token <token-name>\` to retrieve the token)",
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "functions": {
      "description": "All functions",
      "type": "object",
      "additionalProperties": {
        "$ref": "#/definitions/function"
      }
    },
    "permissions": {
      "description": "All permissions",
      "type": "array",
      "items": {
        "$ref": "#/definitions/permission"
      }
    }
  },
  "additionalProperties": false,
  "required": [
    "types"
  ]
}