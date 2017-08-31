import { Region } from '../types'
import 'isomorphic-fetch'
import { isValidProjectName } from '../utils/validation'
import {
  couldNotCreateProjectMessage,
  createdProjectMessage,
  creatingProjectMessage,
  defaultDefinition,
  envExistsButNoEnvNameProvided,
  invalidProjectNameMessage,
} from '../utils/constants'
import out from '../io/Out'
import env from '../io/Environment'
import client from '../io/Client'
import { generateErrorOutput, parseErrors } from '../utils/errors'
import definition from '../io/ProjectDefinition/ProjectDefinition'
import generateName = require('sillyname')
import InteractiveInit from '../utils/components/InteractiveInit'

export interface InitProps {
  name?: string
  alias?: string
  region?: Region
  outputPath?: string
  env?: string
  blank?: boolean
  copyProjectId?: string
}

export default async (props: InitProps): Promise<void> => {

  const newProject = !definition.definition

  if (props.copyProjectId) {
    const info = await client.fetchProjectInfo(props.copyProjectId)
    definition.set(info.projectDefinition)
  }

  if (!definition.definition) {
    const newDefinition = await InteractiveInit()
    definition.set(newDefinition)
  }

  // create new
  if (env.default && !props.env) {
    throw new Error(envExistsButNoEnvNameProvided(env.env))
  }

  if (props.name && !isValidProjectName(props.name)) {
    throw new Error(invalidProjectNameMessage(props.name))
  }

  const name = props.name || generateName()
  out.startSpinner(creatingProjectMessage(name))

  try {
    const projectDefinition = props.blank ? definition.definition : defaultDefinition

    // create project
    const project = await client.createProject(name, projectDefinition, props.alias, props.region)

    // add environment
    const newEnv = props.env || 'dev'
    await env.set(newEnv, project.id)
    definition.set(project.projectDefinition)

    if (newProject) {
      env.setDefault(newEnv)
      definition.save(undefined, true)
    }
    env.save()

    out.stopSpinner()

    const message = createdProjectMessage(name, project.id, props.outputPath)
    out.write(message)

  } catch (e) {
    out.stopSpinner()
    out.writeError(`${couldNotCreateProjectMessage}`)

    if (e.errors) {
      const errors = parseErrors(e)
      const output = generateErrorOutput(errors)
      out.writeError(`${output}`)
    } else {
      throw e
    }
  }
}
