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

    const migrationResult: any = null// = await pushNewSchema(schemaWithFrontmatter, force, resolver)

    out.stopSpinner()

    // no action required
    if (migrationResult.messages.length === 0 && migrationResult.errors.length === 0) {
      out.write(noActionRequiredMessage)
      return
    }

    // migration successful
    else if (migrationResult.messages.length > 0 && migrationResult.errors.length === 0) {
      const migrationMessage = migrationPerformedMessage

      out.write(`${migrationMessage}`)
      printMigrationMessages(migrationResult.messages)
      out.write(`\n`)

      // update project file if necessary

      env.setVersion(envName, migrationResult.newVersion)
      env.save()
    }

    // can't do migration because of issues with schema
    else if (migrationResult.messages.length === 0 && migrationResult.errors.length > 0) {
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
