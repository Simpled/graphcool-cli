import * as path from 'path'

export const projects = {
  request: {
    "query": "\n      {\n        viewer {\n          user {\n            projects {\n              edges {\n                node {\n                  id\n                  name\n                  alias\n                  version\n                  region\n                }\n              }\n            }\n          }\n        }\n      }"
  },
  response: {
      "viewer": {
        "user": {
          "projects": {
            "edges": [
              {
                "node": {
                  "name": "Todo",
                  "alias": null,
                  "version": 4,
                  "id": "citoe33ar0x6p0168xqrpxa5h",
                  "region": "EU_WEST_1"
                }
              },
              {
                "node": {
                  "name": "Northcougar Gargoyle",
                  "alias": null,
                  "version": 1,
                  "id": "cj71vj3rv005z01182nj61w4v",
                  "region": "EU_WEST_1"
                }
              }
            ]
          }
        }
      }
    }
}


export const project = {
  request: {
    "query": "\n      query ($projectId: ID!){\n        viewer {\n          project(id: $projectId) {\n            ...RemoteProject\n          }\n        }\n      }\n      \n  fragment RemoteProject on Project {\n    id\n    name\n    schema\n    alias\n    version\n    region\n    projectDefinitionWithFileContent\n  }\n\n      ",
    "variables": {
      "projectId": "citoe33ar0x6p0168xqrpxa5h"
    }
  },
  response: {
    "viewer": {
      "project": {
        "name": "Todo",
        "projectDefinitionWithFileContent": "{\n  \"modules\": [{\n    \"name\": \"\",\n    \"content\": \"types: ./types.graphql\\nfunctions: {}\\npermissions:\\n- isEnabled: true\\n  operation: Comment.read\\n  authenticated: false\\n  fields:\\n  - citoe3s8m0x7p01688qyrbpqb\\n- isEnabled: true\\n  operation: Comment.create\\n  authenticated: false\\n  fields:\\n  - citoe3s8m0x7p01688qyrbpqb\\n- isEnabled: true\\n  operation: Comment.update\\n  authenticated: false\\n  fields:\\n  - citoe3s8m0x7p01688qyrbpqb\\n- isEnabled: true\\n  operation: Comment.delete\\n  authenticated: false\\n  fields:\\n  - citoe3s8m0x7p01688qyrbpqb\\n- isEnabled: true\\n  operation: File.read\\n  authenticated: false\\n  fields:\\n  - citoe33xn0x6w01684w8aq79m\\n- isEnabled: true\\n  operation: File.create\\n  authenticated: false\\n  fields:\\n  - citoe33xn0x6w01684w8aq79m\\n- isEnabled: true\\n  operation: File.update\\n  authenticated: false\\n  fields:\\n  - citoe33xn0x6w01684w8aq79m\\n- isEnabled: true\\n  operation: File.delete\\n  authenticated: false\\n  fields:\\n  - citoe33xn0x6w01684w8aq79m\\n- isEnabled: true\\n  operation: Test.read\\n  authenticated: false\\n  fields:\\n  - ciuo3088x05v20125xr5vyu21\\n  - ciuo3088x05v00125oqjvwa25\\n  - ciuo6qlpo08vp01259wd59dkz\\n  - ciuo6qd2n08v2012569xtclad\\n  - ciuo3088x05v40125dmqh4coj\\n- isEnabled: true\\n  operation: Test.create\\n  authenticated: false\\n  fields:\\n  - ciuo3088x05v20125xr5vyu21\\n  - ciuo3088x05v00125oqjvwa25\\n  - ciuo6qlpo08vp01259wd59dkz\\n  - ciuo6qd2n08v2012569xtclad\\n  - ciuo3088x05v40125dmqh4coj\\n- isEnabled: true\\n  operation: Test.update\\n  authenticated: false\\n  fields:\\n  - ciuo3088x05v20125xr5vyu21\\n  - ciuo3088x05v00125oqjvwa25\\n  - ciuo6qlpo08vp01259wd59dkz\\n  - ciuo6qd2n08v2012569xtclad\\n  - ciuo3088x05v40125dmqh4coj\\n- isEnabled: true\\n  operation: Test.delete\\n  authenticated: false\\n  fields:\\n  - ciuo3088x05v20125xr5vyu21\\n  - ciuo3088x05v00125oqjvwa25\\n  - ciuo6qlpo08vp01259wd59dkz\\n  - ciuo6qd2n08v2012569xtclad\\n  - ciuo3088x05v40125dmqh4coj\\n- isEnabled: true\\n  operation: Todo.read\\n  authenticated: false\\n  fields:\\n  - citoe3e800x790168y5ahp4nc\\n- isEnabled: true\\n  operation: Todo.create\\n  authenticated: false\\n  fields:\\n  - citoe3e800x790168y5ahp4nc\\n- isEnabled: true\\n  operation: Todo.update\\n  authenticated: false\\n  fields:\\n  - citoe3e800x790168y5ahp4nc\\n- isEnabled: true\\n  operation: Todo.delete\\n  authenticated: false\\n  fields:\\n  - citoe3e800x790168y5ahp4nc\\n- isEnabled: true\\n  operation: User.read\\n  authenticated: false\\n  fields:\\n  - citoe33ar0x6q0168ugz2q0mw\\n  - citoe33wu0x6u0168y90p1tny\\n  - citoe33ar0x6s0168gpygmjkv\\n- isEnabled: true\\n  operation: User.create\\n  authenticated: false\\n  fields:\\n  - citoe33ar0x6q0168ugz2q0mw\\n  - citoe33wu0x6u0168y90p1tny\\n  - citoe33ar0x6s0168gpygmjkv\\n- isEnabled: true\\n  operation: User.update\\n  authenticated: false\\n  fields:\\n  - citoe33ar0x6q0168ugz2q0mw\\n  - citoe33wu0x6u0168y90p1tny\\n  - citoe33ar0x6s0168gpygmjkv\\n- isEnabled: true\\n  operation: User.delete\\n  authenticated: false\\n  fields:\\n  - citoe33ar0x6q0168ugz2q0mw\\n  - citoe33wu0x6u0168y90p1tny\\n  - citoe33ar0x6s0168gpygmjkv\\nrootTokens: []\\n\",\n    \"files\": {\n      \"./types.graphql\": \"type Comment implements Node {\\n  id: ID! @isUnique\\n}\\n\\ntype File implements Node {\\n  contentType: String!\\n  id: ID! @isUnique\\n  name: String!\\n  secret: String! @isUnique\\n  size: Int!\\n  url: String! @isUnique\\n}\\n\\ntype Test implements Node {\\n  createdAt: DateTime\\n  id: ID! @isUnique\\n  morestuff: String\\n  stuff: String!\\n  updatedAt: DateTime\\n}\\n\\ntype Todo implements Node {\\n  id: ID! @isUnique\\n}\\n\\nenum USER_ROLES {\\n  ADMIN\\n}\\n\\ntype User implements Node {\\n  email: String @isUnique\\n  id: ID! @isUnique\\n  password: Password\\n  roles: [USER_ROLES!]\\n}\"\n    }\n  }]\n}",
        "alias": null,
        "version": 4,
        "id": "citoe33ar0x6p0168xqrpxa5h",
        "schema": "type Comment implements Node {\n  id: ID! @isUnique\n}\n\ntype File implements Node {\n  contentType: String!\n  id: ID! @isUnique\n  name: String!\n  secret: String! @isUnique\n  size: Int!\n  url: String! @isUnique\n}\n\ntype Test implements Node {\n  createdAt: DateTime\n  id: ID! @isUnique\n  morestuff: String\n  stuff: String!\n  updatedAt: DateTime\n}\n\ntype Todo implements Node {\n  id: ID! @isUnique\n}\n\nenum USER_ROLES {\n  ADMIN\n}\n\ntype User implements Node {\n  email: String @isUnique\n  id: ID! @isUnique\n  password: Password\n  roles: [USER_ROLES!]\n}",
        "region": "EU_WEST_1"
      }
    }
  }
}

export const defaultVolume = {
  [path.join(process.cwd(), "test.out")]: "Checking out new project...\n\u001b[1m\nWritten to graphcool.yml\u001b[22m\u001b[1m\nWritten to ./types.graphql\u001b[22m\n\nPulled project with id \"citoe33ar0x6p0168xqrpxa5h\" and environment \"dev\"\n",
  [path.join(process.cwd(), "graphcool.yml")]: "types: ./types.graphql\nfunctions: {}\npermissions:\n- isEnabled: true\n  operation: Comment.read\n  authenticated: false\n  fields:\n  - citoe3s8m0x7p01688qyrbpqb\n- isEnabled: true\n  operation: Comment.create\n  authenticated: false\n  fields:\n  - citoe3s8m0x7p01688qyrbpqb\n- isEnabled: true\n  operation: Comment.update\n  authenticated: false\n  fields:\n  - citoe3s8m0x7p01688qyrbpqb\n- isEnabled: true\n  operation: Comment.delete\n  authenticated: false\n  fields:\n  - citoe3s8m0x7p01688qyrbpqb\n- isEnabled: true\n  operation: File.read\n  authenticated: false\n  fields:\n  - citoe33xn0x6w01684w8aq79m\n- isEnabled: true\n  operation: File.create\n  authenticated: false\n  fields:\n  - citoe33xn0x6w01684w8aq79m\n- isEnabled: true\n  operation: File.update\n  authenticated: false\n  fields:\n  - citoe33xn0x6w01684w8aq79m\n- isEnabled: true\n  operation: File.delete\n  authenticated: false\n  fields:\n  - citoe33xn0x6w01684w8aq79m\n- isEnabled: true\n  operation: Test.read\n  authenticated: false\n  fields:\n  - ciuo3088x05v20125xr5vyu21\n  - ciuo3088x05v00125oqjvwa25\n  - ciuo6qlpo08vp01259wd59dkz\n  - ciuo6qd2n08v2012569xtclad\n  - ciuo3088x05v40125dmqh4coj\n- isEnabled: true\n  operation: Test.create\n  authenticated: false\n  fields:\n  - ciuo3088x05v20125xr5vyu21\n  - ciuo3088x05v00125oqjvwa25\n  - ciuo6qlpo08vp01259wd59dkz\n  - ciuo6qd2n08v2012569xtclad\n  - ciuo3088x05v40125dmqh4coj\n- isEnabled: true\n  operation: Test.update\n  authenticated: false\n  fields:\n  - ciuo3088x05v20125xr5vyu21\n  - ciuo3088x05v00125oqjvwa25\n  - ciuo6qlpo08vp01259wd59dkz\n  - ciuo6qd2n08v2012569xtclad\n  - ciuo3088x05v40125dmqh4coj\n- isEnabled: true\n  operation: Test.delete\n  authenticated: false\n  fields:\n  - ciuo3088x05v20125xr5vyu21\n  - ciuo3088x05v00125oqjvwa25\n  - ciuo6qlpo08vp01259wd59dkz\n  - ciuo6qd2n08v2012569xtclad\n  - ciuo3088x05v40125dmqh4coj\n- isEnabled: true\n  operation: Todo.read\n  authenticated: false\n  fields:\n  - citoe3e800x790168y5ahp4nc\n- isEnabled: true\n  operation: Todo.create\n  authenticated: false\n  fields:\n  - citoe3e800x790168y5ahp4nc\n- isEnabled: true\n  operation: Todo.update\n  authenticated: false\n  fields:\n  - citoe3e800x790168y5ahp4nc\n- isEnabled: true\n  operation: Todo.delete\n  authenticated: false\n  fields:\n  - citoe3e800x790168y5ahp4nc\n- isEnabled: true\n  operation: User.read\n  authenticated: false\n  fields:\n  - citoe33ar0x6q0168ugz2q0mw\n  - citoe33wu0x6u0168y90p1tny\n  - citoe33ar0x6s0168gpygmjkv\n- isEnabled: true\n  operation: User.create\n  authenticated: false\n  fields:\n  - citoe33ar0x6q0168ugz2q0mw\n  - citoe33wu0x6u0168y90p1tny\n  - citoe33ar0x6s0168gpygmjkv\n- isEnabled: true\n  operation: User.update\n  authenticated: false\n  fields:\n  - citoe33ar0x6q0168ugz2q0mw\n  - citoe33wu0x6u0168y90p1tny\n  - citoe33ar0x6s0168gpygmjkv\n- isEnabled: true\n  operation: User.delete\n  authenticated: false\n  fields:\n  - citoe33ar0x6q0168ugz2q0mw\n  - citoe33wu0x6u0168y90p1tny\n  - citoe33ar0x6s0168gpygmjkv\nrootTokens: []\n",
  [path.join(process.cwd(), "types.graphql")]: "type Comment implements Node {\n  id: ID! @isUnique\n}\n\ntype File implements Node {\n  contentType: String!\n  id: ID! @isUnique\n  name: String!\n  secret: String! @isUnique\n  size: Int!\n  url: String! @isUnique\n}\n\ntype Test implements Node {\n  createdAt: DateTime\n  id: ID! @isUnique\n  morestuff: String\n  stuff: String!\n  updatedAt: DateTime\n}\n\ntype Todo implements Node {\n  id: ID! @isUnique\n}\n\nenum USER_ROLES {\n  ADMIN\n}\n\ntype User implements Node {\n  email: String @isUnique\n  id: ID! @isUnique\n  password: Password\n  roles: [USER_ROLES!]\n}",
  [path.join(process.cwd(), ".graphcoolrc")]: "default: dev\nenvironments:\n  dev:\n    projectId: citoe33ar0x6p0168xqrpxa5h\n    version: 4\n"
}