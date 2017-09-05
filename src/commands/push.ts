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
  potentialDataLossMessage, potentialChangesMessage
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
  isDryRun: boolean
}

export default async function pushCommand({force, projectEnvironment: {projectId, version}, envName, isDryRun}: PushPullProps): Promise<void> {
  const projectInfo = await client.fetchProjectInfo(projectId)
  if (!projectInfo) {
    throw new Error(invalidProjectFileMessage)
  }

  out.startSpinner(pushingNewSchemaMessage(projectId, version, envName))

  try {

    // first compare local and remote versions and fail if remote is ahead
    if (projectInfo.version > version) {
      out.stopSpinner()
      throw new Error(remoteSchemaAheadMessage(projectInfo.version, version))
    }

    const migrationResult  = await client.push(projectId, force, isDryRun, version, definition.definition!)

    out.stopSpinner()

    // no action required
    if ((!migrationResult.migrationMessages || migrationResult.migrationMessages.length === 0) && (!migrationResult.errors || migrationResult.errors.length === 0)) {
      out.write(noActionRequiredMessage(projectId, envName))
      return
    }

    // migration successful
    else if (migrationResult.migrationMessages.length > 0 && migrationResult.errors.length === 0) {
      if (isDryRun) {
        out.write(potentialChangesMessage)
      } else {
        out.write(migrationPerformedMessage(projectId, migrationResult.newVersion, envName))
      }
      printMigrationMessages(migrationResult.migrationMessages)
      out.write(`\n`)


      if (!isDryRun) {
        env.setVersion(envName, migrationResult.newVersion)
        env.save()

        definition.set(migrationResult.projectDefinition)
        definition.saveTypes()
      }
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
