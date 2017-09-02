import * as os from 'os'
import * as path from 'path'
import * as chalk from 'chalk'
import figures = require('figures')
import { EnvironmentConfig, ProjectDefinition, ProjectEnvironment, ProjectInfo } from '../types'

/*
 * Networking & URLs
 */
export const authUIEndpoint = process.env.ENV === 'DEV' ? 'https://dev.console.graph.cool/cli/auth' : 'https://console.graph.cool/cli/auth'
export const systemAPIEndpoint = process.env.ENV === 'DEV' ? 'https://dev.api.graph.cool/system' : 'https://api.graph.cool/system'
export const authEndpoint = process.env.ENV === 'DEV' ? 'https://cli-auth-api.graph.cool/dev' : 'https://cli-auth-api.graph.cool/prod'
export const docsEndpoint = process.env.ENV === 'DEV' ? 'https://dev.graph.cool/docs' : 'https://www.graph.cool/docs'
export const statusEndpoint = 'https://crm.graph.cool/prod/status'
export const consoleURL = (token: string, projectName?: string) =>
  `https://console.graph.cool/token?token=${token}${projectName ? `&redirect=/${encodeURIComponent(projectName)}` : ''}`
export const playgroundURL = (token: string, projectName: string) =>
  `https://console.graph.cool/token?token=${token}&redirect=/${encodeURIComponent(projectName)}/playground`
export const sampleSchemaURL = `http://graphqlbin.com/empty.graphql`

/*
 * Sentry
 */
export const sentryDSN = 'https://6ef6eea3afb041f2aca71d08742a36d1:51bdc5643a7648ffbfb3d3017879467c@sentry.io/178603'

/*
 * File paths / names
 */
export const graphcoolEnvironmentFileName = '.env.gcl'
// TODO enable when we have the new flow here defined
// export const graphcoolCloneProjectFileName = (projectFileName?: string) => projectFileName ?
//   `clone-${projectFileName.startsWith(`./`) ? projectFileName.substring(2) : projectFileName}`: `clone-${graphcoolProjectFileName}`
export const graphcoolRCFilePath = path.join(os.homedir(), '.graphcool')
export const projectFileSuffix = '.graphcool'
export const schemaFileSuffix = '.graphql'
export const exampleSchema = `\
# \`User\` is a system type with special characteristics.
# You can read about it in the documentation:
# https://www.graph.cool/docs/reference/schema/system-artifacts-uhieg2shio/#user-type
type User {
  id: ID! @isUnique
  createdAt: DateTime!
  updatedAt: DateTime!
}

# \`File\` is a system type with special characteristics.
# You can read about it in the documentation:
# https://www.graph.cool/docs/reference/schema/system-artifacts-uhieg2shio/#file-type
type File {
  id: ID! @isUnique
  createdAt: DateTime!
  updatedAt: DateTime!
  contentType: String!
  name: String!
  secret: String! @isUnique
  size: Int!
  url: String! @isUnique
}

# You can easily add custom types, here is an example.
# If you want to add the \`Tweet\` type to your schema,
# remove the below comments and run \`graphcool push\`.
# type Tweet {
#   text: String!
# }`

export const blankProjectFileFromExampleSchema = (projectId: string, version: string) => `\
# project: ${projectId}
# version: ${version}


###########################################################################
# \`User\` and \`File\` are generated and have special characteristics.
# You can read about them in the documentation:
# https://www.graph.cool/docs/reference/schema/system-artifacts-uhieg2shio/
###########################################################################

type User {
  id: ID! @isUnique
  createdAt: DateTime!
  updatedAt: DateTime!
}

type File {
  id: ID! @isUnique
  createdAt: DateTime!
  updatedAt: DateTime!
  contentType: String!
  name: String!
  secret: String! @isUnique
  size: Int!
  url: String! @isUnique
}


###########################################################################
# You can easily add custom definitions, \`Tweet\` below is an example.
# If you want to add \`Tweet\` to your schema,
# remove the below comments and run \`graphcool push\`.
###########################################################################

# type Tweet {
#   text: String!
# }`


/*
 * Terminal output: auth
 */
export const openBrowserMessage = `You need to authenticate. Your browser will open shortly...`
export const couldNotRetrieveTokenMessage = `Whoops, something went wrong during authentication.
`

export const authenticationSuccessMessage = (email: string) => ` ${chalk.green(figures.tick)} Authenticated user: ${chalk.bold(email)}
`

/*
 * Terminal output: create
 */
export const creatingProjectMessage = (name: string) => `Creating project ${chalk.bold(name)}...`
// TODO incorporate environment into createdProjectMessage
// something like: it's now accessible with the env 'dev'
export const createdProjectMessage = (name: string, projectId: string, projectOutputPath?: string) => `\
 ${chalk.green(figures.tick)} Created project ${chalk.bold(name)} (ID: ${projectId}) successfully.


   ${chalk.bold('Here is what you can do next:')}

   1) Open ${chalk.bold(projectOutputPath || 'project.graphcool')} in your editor to update your schema.
      You can push your changes using ${chalk.cyan('`graphcool push`')}.

   2) Use one of the following endpoints to connect to your GraphQL API:

        Simple API:   https://api.graph.cool/simple/v1/${projectId}
        Relay API:    https://api.graph.cool/relay/v1/${projectId}

   3) Edit your project using the Console. Run ${chalk.cyan('`graphcool console`')} to open it.
`

export const couldNotCreateProjectMessage = `\
Whoops, something went wrong while creating the project.

`

export const envExistsButNoEnvNameProvided = (env: EnvironmentConfig) => `\
You already have a project environment set up with the environments "${Object.keys(env.environments).join(', ')}".
In order to create a new project, either do that in a seperate folder or add it to the current environments with
providing the --env option.
`

export const noDefaultEnvironmentProvidedMessage = `\
You didn't provide a default project environment yet. Either specify the environment with --env env-name or add a new one
with 'graphcool env set dev PROJECT_ID'
`

export const envDoesntExist = (env: string) => `\
  The provided environment "${env}" doesn't exist.
`

export const cantCopyAcrossRegions = `\
A project can't be copied across regions. Please specify the --copy parameter without --region.
`

export const invalidProjectNameMessage = (projectName: string) => `\
'${projectName}' is not a valid project name. It must begin with an uppercase letter.
`

export const howDoYouWantToGetStarted = () => `\

  You are about to create a new Graphcool project.


  ${chalk.bold('How do you want to continue?')}

`

export const invalidSchemaFileMessage = (schemaFileName: string) => `\
Your schema file ${chalk.bold(schemaFileName)} is invalid. A schema file must end with ${chalk.bold(schemaFileSuffix)}.
`

/*
 * Terminal output: push
 */

export const remoteSchemaAheadMessage = (remoteVersion: number, localVersion: number) => `\
The local version of your schema (${localVersion}) is behind the remote version (${remoteVersion}). Save your local changes and run ${chalk.cyan(`\`graphcool pull\``)} before retrying.`

export const noProjectFileForPushMessage = `\
Please provide a valid project environment (${graphcoolEnvironmentFileName}) for the schema migration.
`

export const invalidProjectFileMessage = `\
The project environment file (${graphcoolEnvironmentFileName}) that you provided doesn't seem to be valid. Please make sure it contains the ID of your project.
`

export const pushingNewSchemaMessage = `\
Pushing your project...`


export const noActionRequiredMessage = `\
 ${chalk.green(figures.tick)} Identical project definition, no action required.
`

export const migrationPerformedMessage = `\
 ${chalk.green(figures.tick)} Your project was successfully updated. Here are the changes:
`

export const migrationErrorMessage = `\
There are issues with the new project definition:

`

export const potentialDataLossMessage = `\
Your changes might result in data loss.
Review your changes with ${chalk.cyan(`\`graphcool status\``)} or use ${chalk.cyan(`\`graphcool push --force\``)} if you know what you're doing!
`

export const invalidProjectFilePathMessage = (projectFilePath: string) => `\
${projectFilePath} is not a valid project file (must end with ${projectFileSuffix}).
`

export const multipleProjectFilesMessage = (projectFiles: string[]) => `\
Found ${projectFiles.length} project files. You can specify the one you want to push, e.g.: ${chalk.cyan(`\`graphcool push ${projectFiles[0]}\``)}`

/*
 * Terminal output: projects
 */

export const couldNotFetchProjectsMessage = `\
An error occured while trying to fetch your projects.
`


/*
 * Terminal output: endpoints
 */

export const endpointsMessage = (projectId: string) => `\
The ${chalk.bold('endpoints')} for your project are:

  Simple API:         https://api.graph.cool/simple/v1/${projectId}
  Relay API:          https://api.graph.cool/relay/v1/${projectId}
  Subscriptions API:  wss://subscriptions.graph.cool/v1/${projectId}
  File API:           https://api.graph.cool/file/v1/${projectId}
`

export const multipleProjectFilesForEndpointsMessage = (projectFiles: string[]) => `\
Found ${projectFiles.length} project files. You can specify the one you for which you want to display the endpoints, e.g.: ${chalk.cyan(`\`graphcool endpoints ${projectFiles[0]}\``)}`


/*
 * Terminal output: pull
 */

export const fetchingProjectDataMessage = `\
Fetching project data ...`

export const noProjectIdMessage = `\
Please provide a valid project ID.
`

export const wroteProjectFileMessage = (projectFile: string) => `\
 ${chalk.green(figures.tick)} Your project file (${chalk.bold(projectFile)}) was successfully updated. Reload it in your editor if needed.
`

export const pulledInitialProjectFileMessage = (projectFile: string) => `\
 ${chalk.green(figures.tick)} Your project file was written to ${chalk.bold(projectFile)}
`

export const newVersionMessage = (newVersion: string) => `\
The new schema version is ${chalk.bold(newVersion)}.
`

export const warnOverrideProjectFileMessage = `\
You are about to override the local project. Make sure to save local changes that you want to preserve.
Do you want to continue? [y|N] `

export const multipleProjectFilesForPullMessage = (projectFiles: string[]) => `\
Found ${projectFiles.length} project files. You can specify the one you want for which you want to pull the new schema, e.g.: ${chalk.cyan(`\`graphcool pull ${projectFiles[0]}\``)}
`


/*
 * Terminal output: export
 */
export const exportingDataMessage = `\
Exporting your project data ...`

export const downloadUrlMessage = (url: string) => `\
 ${chalk.green(figures.tick)} You can download your project data by pasting this URL in a browser:

   ${chalk.blue(figures.pointer)} Download URL: ${url}
`

export const multipleProjectFilesForExportMessage = (projectFiles: string[]) => `\
Found ${projectFiles.length} project files. You can specify the one you for which you want to export the data, e.g.: ${chalk.cyan(`\`graphcool export ${projectFiles[0]}\``)}`


/*
 * Terminal output: console
 */
export const openedConsoleMessage = (projectName?: string) => projectName ? `\
The Console for project ${chalk.bold(projectName)} was opened in your browser.
` : `\
The Console was opened in your browser.
`


/*
 * Terminal output: clone
 */
export const multipleProjectFilesForCloneMessage = (projectFiles: string[]) => `\
Found ${projectFiles.length} project files. You can specify the one for which you want to clone the project, e.g.: ${chalk.cyan(`\`graphcool clone ${projectFiles[0]}\``)}
`

export const cloningProjectMessage = `\
Cloning your project ...`

export const clonedProjectMessage = (clonedProjectName: string, outputPath: string, projectId: string) => `\
 ${chalk.green(figures.tick)} Cloned your project as ${chalk.bold(clonedProjectName)}. The project file was written to ${chalk.bold(outputPath)}.

   Here are your endpoints:

        Simple API:   https://api.graph.cool/simple/v1/${projectId}
        Relay API:    https://api.graph.cool/relay/v1/${projectId}
`


/*
 * Terminal output: playground
 */
export const tooManyProjectFilesForPlaygroundMessage = (projectFiles: string[]) => `\
Found ${projectFiles.length} project files. You can specify the one you for which you want open the Playground, e.g.: ${chalk.cyan(`\`graphcool playground ${projectFiles[0]}\``)}
`

export const openedPlaygroundMessage = (projectName: string) => `\
The Playground for project ${chalk.bold(projectName)} was opened in your browser.
`

/*
 * Terminal output: quickstart
 */
export const openedQuickstartMessage = `\
The Quickstart tutorial was opened in your browser.
`

/*
 * Terminal output: status
 */
export const multipleProjectFilesForStatusMessage = (projectFiles: string[]) => `\
Found ${projectFiles.length} project files. You can specify the one you for which you want display the status, e.g.: ${chalk.cyan(`\`graphcool status ${projectFiles[0]}\``)}
`

export const localSchemaBehindRemoteMessage = (remoteVersion: string, localVersion: string) => `\
The local version of your schema (${localVersion}) is behind the remote version (${remoteVersion}).
Save your local changes and execute ${chalk.cyan(`\`graphcool pull\``)} before a schema migration.
`

export const remoteSchemaBehindLocalMessage = (remoteVersion: string, localVersion: string) => `\
The remote version (${remoteVersion}) is behind the local version (${localVersion}). Please don't make manual changes to the project file's header.
`

export const statusHeaderMessage = (projectId: string, version: string) => `\
Project ID: ${projectId}
Remote Schema Version: ${version}

`

export const everythingUpToDateMessage = `\
Everything up-to-date.
`

export const potentialChangesMessage = `\
Here are all the local changes:
`

export const usePushToUpdateMessage = `
Use ${chalk.cyan(`\`graphcool push\``)} to apply your schema changes.
`

export const issuesInSchemaMessage = `\
The current version of your schema contains some issues:

`

export const destructiveChangesInStatusMessage = `\

Pushing the current version of your schema can result in data loss.
Use ${chalk.cyan(`\`graphcool push --force\``)} if you know what you're doing!
`

/*
 * Terminal output: delete
 */

export const deletingProjectMessage = (projectId?: string) => projectId ? `\
Deleting project with Id ${projectId} ...` : `\
Deleting projects ...`

export const deletingProjectsMessage = (projectIds: string[]) => `\
Deleting ${projectIds.length} projects ...`

export const deletedProjectMessage = (projectIds: string[]) => projectIds.length > 1 ? `\
${chalk.green(figures.tick)} Successfully deleted ${projectIds.length} projects.` : `\
${chalk.green(figures.tick)} Your project was successfully deleted.`

export const deletingProjectWarningMessage = `\
Are you absolutely sure you want to delete these projects? ${chalk.bold(`This operation can not be undone!`)} [y|N]`

/*
 * Terminal output: general
 */

export const contactUsInSlackMessage = `\
 * Get in touch if you need help: http://slack.graph.cool/`

export const setDebugMessage = `\
 * You can enable additional output by setting \`export DEBUG=graphcool\` and rerunning the command.
 * Open an issue on GitHub: https://github.com/graphcool/graphcool-cli.`

export const noProjectFileOrIdMessage = `\
No project file or project ID provided.
`

export const noProjectFileMessage = `\
No project file found.
`

export const notAuthenticatedMessage = `\
You're currently not logged in. You can use the auth command to authenticate with ${chalk.cyan(`\`graphcool auth\``)}
`

export const canNotReadVersionFromProjectFile = (projectFile: string) => `\
No schema version specified in ${chalk.bold(projectFile)}.
`

export const canNotReadProjectIdFromProjectFile = `\
Could not read the project's ID from project file.
`

export const unknownOptionsWarning = (command: string, unknownOptions: string[]) => unknownOptions.length > 1 ? `\
${chalk.bold('Error:')} The following options are not recognized: ${chalk.red(`${unknownOptions.map(a => a)}`)}
Use ${chalk.cyan(`\`graphcool ${command} --help\``)} to see a list of all possible options.
` : `\
${chalk.bold('Error:')} The following option is not recognized: ${chalk.red(`${unknownOptions[0]}`)}
Use ${chalk.cyan(`\`graphcool ${command} --help\``)} to see a list of all possible options.
`


export const defaultDefinition: ProjectDefinition = {
    "modules": [
      {
        "name": "",
        "content": "types: ./types.graphql\nfunctions:\n  filter-posts:\n    isEnabled: true\n    handler:\n      code:\n        src: ./code/filter-posts.js\n    type: operationBefore\n    operation: Post.create\n  log-posts:\n    isEnabled: true\n    handler:\n      code:\n        src: ./code/log-posts.js\n    type: subscription\n    query: ./code/log-posts.graphql\n  weather:\n    isEnabled: true\n    handler:\n      code:\n        src: ./code/weather.js\n    type: schemaExtension\n    schema: ./code/weather.graphql\npermissions:\n- isEnabled: true\n  operation: File.read\n  authenticated: false\n- isEnabled: true\n  operation: File.create\n  authenticated: false\n- isEnabled: true\n  operation: File.update\n  authenticated: false\n- isEnabled: true\n  operation: File.delete\n  authenticated: false\n- isEnabled: true\n  operation: Post.read\n  authenticated: false\n- isEnabled: true\n  operation: Post.create\n  authenticated: true\n- isEnabled: true\n  operation: Post.update\n  authenticated: false\n- isEnabled: true\n  operation: Post.delete\n  authenticated: false\n- isEnabled: true\n  operation: User.read\n  authenticated: false\n- isEnabled: true\n  operation: User.create\n  authenticated: false\n- isEnabled: true\n  operation: User.update\n  authenticated: false\n- isEnabled: true\n  operation: User.delete\n  authenticated: false\nrootTokens: []\n",
        "files": {
          "./types.graphql": "type File implements Node {\n  contentType: String!\n  createdAt: DateTime!\n  id: ID! @isUnique\n  name: String!\n  secret: String! @isUnique\n  size: Int!\n  updatedAt: DateTime!\n  url: String! @isUnique\n}\n\ntype User implements Node {\n  createdAt: DateTime!\n  id: ID! @isUnique\n  updatedAt: DateTime!\n}\n\ntype Post implements Node {\n  title: String!\n  description: String!\n  createdAt: DateTime!\n  id: ID! @isUnique\n  updatedAt: DateTime!\n}",
          "./code/filter-posts.js": "// Click \"EXAMPLE EVENT\" to see whats in `event`\nmodule.exports = function (event) {\n  console.log(event.data)\n  if (event.data.createPost.description.includes('bad') {\n  \treturn {error: 'bad is not allowed'}\n  }\n  return {data: event.data}\n}\n",
          "./code/log-posts.js": "// Click \"EXAMPLE EVENT\" to see whats in `event`\nmodule.exports = function (event) {\n  console.log(event.data)\n  return {data: event.data}\n}\n",
          "./code/log-posts.graphql": "subscription {\n  Post(filter: {\n    mutation_in: [CREATED, UPDATED, DELETED]\n  }) {\n    updatedFields\n    node {\n      id\n    }\n  }\n}",
          "./code/weather.js": "const fetch = require('node-fetch')\n\nmodule.exports = function (event) {\n  const city = event.data.city\n  return fetch(getApiUrl(city))\n  .then(res => res.json())\n  .then(data => {\n    console.log(data)\n    return {\n      data: {\n        temperature: data.main.temp,\n        pressure: data.main.pressure,\n        windSpeed: data.wind.speed,\n      }\n    }\n  })\n}\n\nfunction getApiUrl(query) {\n\treturn `http://samples.openweathermap.org/data/2.5/weather?q=${query}&appid=b1b15e88fa797225412429c1c50c122a1`\n  }",
          "./code/weather.graphql": "type WeatherPayload {\n  temperature: Float!\n  pressure: Float!\n  windSpeed: Float!\n}\n\nextend type Query {\n  weather(city: String!): WeatherPayload\n}\n"
        }
      }
    ]
  }



export const infoMessage = (envName: string, env: ProjectEnvironment, info: ProjectInfo) => `\
${chalk.bold('Local Environment')}
default: ${envName}
projectId: ${env.projectId}
version: ${env.version}

${chalk.bold('Remote Environment')}
projectId: ${info.id}
version: ${info.version}

`


/**
 * Environment
 */

export const envSet = (name: string, projectId: string) => `\
Environment ${name} set to ${projectId}
`

export const envRename = (oldName: string, newName) => `\
Renamed environment ${oldName} to ${newName}
`

export const envRemove = (envName: string) => `\
Removed environment ${envName}
`

export const envDefault = (envName: string) => `\
Successfully set ${envName} as the default environment
`