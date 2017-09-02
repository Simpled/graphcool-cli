import {
  fetchingProjectDataMessage,
  warnOverrideProjectFileMessage
} from '../utils/constants'
import out from '../io/Out'
import { ProjectSelection } from '../utils/components/ProjectSelection'
import { ProjectEnvironment, ProjectInfo } from '../types'
import definition from '../io/ProjectDefinition/ProjectDefinition'
import client from '../io/Client'
import { diff, printDiff } from '../io/ProjectDefinition/diff'
import { generateErrorOutput, parseErrors } from '../utils/errors'
import env from '../io/Environment'
import Prompt from '../utils/components/Prompt'

interface PullProps {
  projectId: string | null
  force?: boolean
  projectEnvironment?: ProjectEnvironment | null
  envName?: string
}

export default async (props: PullProps): Promise<void> => {

  let projectId = props.projectId || await ProjectSelection()
  let envName = props.envName || 'dev'
  let projectInfo: ProjectInfo
  const newProject = !definition.definition
  let changed = false

  try {
    out.startSpinner(`${fetchingProjectDataMessage}`)
    projectInfo = await client.fetchProjectInfo(projectId)
    out.stopSpinner()

    if (!newProject && !props.force) {
      const projectDiff = diff(definition.definition!.modules[0], projectInfo.projectDefinition.modules[0])
      printDiff(projectDiff)
      if (projectDiff.changed) {
        await Prompt(warnOverrideProjectFileMessage)

        definition.set(projectInfo.projectDefinition)
        await definition.save(Object.keys(projectDiff.files))
        await env.setEnv(envName, {projectId, version: projectInfo.version})
        if (newProject) {
          env.setDefault(envName)
        }
        env.save()
        out.write(`\n\nPulled project with id "${projectId}" and environment "${envName}"`)
      } else {
        await env.setEnv(envName, {projectId, version: projectInfo.version})
        env.save()
      }
    } else if (newProject) {
      definition.set(projectInfo.projectDefinition)
      out.write('Checking out new project...')
      await definition.save()
      await env.setEnv(envName, {projectId, version: projectInfo.version})
      if (newProject) {
        env.setDefault(envName)
      }
      env.save()
      out.write(`\n\nPulled project with id "${projectId}" and environment "${envName}"\n`)
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
