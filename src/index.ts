#!/usr/bin/env node

import 'source-map-support/register'
import { CommandInstruction } from './types'
import pushCommand, { PushPullCliProps } from './commands/push'
import consoleCommand, { ConsoleProps } from './commands/console'
import playgroundCommand, { PlaygroundProps } from './commands/playground'
import projectsCommand from './commands/projects'
import pullCommand from './commands/pull'
import initCommand, { InitProps } from './commands/init'
import exportCommand, { ExportProps } from './commands/export'
import quickstartCommand from './commands/quickstart'
import deleteCommand, { DeleteCliProps } from './commands/delete'
import authCommand, { AuthProps } from './commands/auth'
import infoCommand, { InfoProps } from './commands/info'
import { parseCommand } from './utils/parseCommand'
import { checkAuth } from './utils/auth'
import { GraphcoolAuthServer } from './io/GraphcoolAuthServer'
import { noDefaultEnvironmentProvidedMessage, sentryDSN, } from './utils/constants'
import { usageRoot, } from './utils/usage'
import env from './io/Environment'
import { pick } from 'lodash'
import out from './io/Out'
import definition from './io/ProjectDefinition/ProjectDefinition'

const Raven = require('raven')
const {version} = require('../../package.json')

async function main() {
  // initialize sentry
  Raven.config(sentryDSN).install()

  const {command, props}: CommandInstruction = await parseCommand(process.argv, version)

  switch (command) {

    case undefined: {
      process.stdout.write(usageRoot())
      process.exit(0)
    }
    case 'init': {
      await definition.load()
      await checkAuth('init')
      const projectId = (props as any).projectId
      await initCommand(props as InitProps)
      break
    }

    case 'status':
    case 'push': {
      await definition.load()
      await checkAuth('auth')
      const projectId = await env.getProjectId(pick<any, any>(props as PushPullCliProps, ['project', 'env']))
      if (!projectId) {
        throw new Error(noDefaultEnvironmentProvidedMessage)
      }
      const projectEnvironment = env.getEnvironment(projectId)
      if (!projectEnvironment) {
        throw new Error(`In order to push you need to have project id ${projectId} in the local .graphcool.env`)
      }
      await pushCommand({
        ...projectEnvironment,
        force: (props as any).force,
        isDryRun: command === 'status',
      })
      break
    }

    case 'pull': {
      await definition.load()
      await checkAuth('auth')
      const projectId = await env.getProjectId(pick<any, any>(props as PushPullCliProps, ['project', 'env']))
      const projectEnvironment = env.getEnvironment(projectId || '')
      await pullCommand({
        projectId,
        force: (props as any).force,
        ...projectEnvironment,
      })
      break
    }

    case 'delete': {
      await definition.load()
      await checkAuth('auth')
      const projectId = await env.getProjectId({...props, skipDefault: true})
      await deleteCommand({projectId})
      break
    }

    case 'export': {
      await checkAuth('auth')
      await exportCommand(props as ExportProps)
      break
    }

    case 'info': {
      await checkAuth('auth')
      const projectId = await env.getProjectId(props as any)
      if (!projectId) {
        throw new Error(noDefaultEnvironmentProvidedMessage)
      }
      const projectEnvironment = env.getEnvironment(projectId)
      if (!projectEnvironment) {
        throw new Error(`In order to push you need to have project id ${projectId} in the local .graphcool.env`)
      }
      await infoCommand({projectId, ...projectEnvironment} as InfoProps)
      break
    }

    case 'console': {
      await checkAuth('auth')
      const projectId = await env.getProjectId(props as any)
      await consoleCommand({projectId} as ConsoleProps)
      break
    }

    case 'playground': {
      await checkAuth('auth')
      const projectId = await env.getProjectId(props as any)
      await playgroundCommand({projectId} as PlaygroundProps)
      break
    }

    case 'projects': {
      await checkAuth('auth')
      await projectsCommand({})
      break
    }

    case 'auth': {
      await authCommand(props as AuthProps, new GraphcoolAuthServer('auth'))
      break
    }

    case 'quickstart': {
      await quickstartCommand({})
      break
    }

    case 'help': {
      process.stdout.write(usageRoot())
      process.exit(0)
      break
    }

    case 'version': {
      process.stdout.write(version)
      break
    }

    case 'unknown':
    default: {
      process.stdout.write(`Unknown command: ${command}\n\n${usageRoot()}`)
      break
    }
  }

  process.stdout.write('\n')
}

process.on('unhandledRejection', e => out.onError(e))

main()
