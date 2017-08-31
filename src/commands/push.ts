import {
  ProjectEnvironment,
} from '../types'
import {
  pushingNewSchemaMessage,
  noActionRequiredMessage,
  migrationPerformedMessage,
  migrationErrorMessage,
  invalidProjectFileMessage,
  remoteSchemaAheadMessage,
  potentialDataLossMessage
} from '../utils/constants'
import out from '../io/Out'
import client from '../io/Client'
import { printMigrationErrors, printMigrationMessages } from '../utils/migration'
import env from '../io/Environment'
import { generateErrorOutput, parseErrors } from '../utils/errors'
import definition from '../io/ProjectDefinition/ProjectDefinition'

export interface PushPullCliProps {
  project?: string
  env?: string
}

export interface PushPullProps {
  force: boolean
  projectEnvironment: ProjectEnvironment
  envName: string
}

export default async ({force, projectEnvironment: {projectId, version}, envName}: PushPullProps): Promise<void> => {
  const projectInfo = await client.fetchProjectInfo(projectId)
  if (!projectInfo) {
    throw new Error(invalidProjectFileMessage)
  }

  out.startSpinner(pushingNewSchemaMessage)

  try {

    // first compare local and remote versions and fail if remote is ahead
    if (projectInfo.version > version) {
      out.stopSpinner()
      throw new Error(remoteSchemaAheadMessage(projectInfo.version, version))
    }

    const migrationResult  = await client.push(projectId, force, false, version, definition.definition)

    out.stopSpinner()

    // no action required
    if ((!migrationResult.migrationMessages || migrationResult.migrationMessages.length === 0) && (!migrationResult.errors || migrationResult.errors.length === 0)) {
      out.write(noActionRequiredMessage)
      return
    }

    // migration successful
    else if (migrationResult.migrationMessages.length > 0 && migrationResult.errors.length === 0) {
      const migrationMessage = migrationPerformedMessage

      out.write(`${migrationMessage}`)
      printMigrationMessages(migrationResult.migrationMessages)
      out.write(`\n`)


      env.setVersion(envName, migrationResult.newVersion)
      env.save()

      definition.set(migrationResult.projectDefinition)
      definition.save(undefined, true)
    }

    // can't do migration because of issues with schema
    else if (migrationResult.migrationMessages.length === 0 && migrationResult.errors.length > 0) {
      out.write(`${migrationErrorMessage}`)
      printMigrationErrors(migrationResult.errors)
      out.write(`\n`)
    }

    // potentially destructive changes
    else if (migrationResult.errors[0].description.indexOf(`destructive changes`) >= 0) {
      out.write(potentialDataLossMessage)
    }

  } catch (e) {
    out.stopSpinner()

    if (e.errors) {
      const errors = parseErrors(e)
      const output = generateErrorOutput(errors)
      out.writeError(`${output}`)
    } else {
      throw e
    }
  }

}
