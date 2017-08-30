import {
  fetchingProjectDataMessage,
  warnOverrideProjectFileMessage
} from '../utils/constants'
import out from '../io/Out'
import { interactiveProjectSelection } from '../utils/projectSelection'
import { ProjectEnvironment, ProjectInfo } from '../types'
import definition from '../io/ProjectDefinition/ProjectDefinition'
import client from '../io/Client'
import { diff, printDiff } from '../io/ProjectDefinition/diff'
import { generateErrorOutput, parseErrors } from '../utils/errors'
import env from '../io/Environment'

const {terminal} = require('terminal-kit')

interface PullProps {
  projectId: string | null
  force?: boolean
  projectEnvironment?: ProjectEnvironment | null
  envName?: string
}

export default async (props: PullProps): Promise<void> => {

  let projectId = props.projectId || await interactiveProjectSelection()
  let envName = props.envName || 'dev'
  let projectInfo: ProjectInfo
  const newProject = !definition.definition
  let changed = false

  try {
    out.startSpinner(`${fetchingProjectDataMessage}`)
    projectInfo = await client.fetchProjectInfo(projectId)
    out.stopSpinner()

    if (!newProject && !props.force) {
      const projectDiff = diff(definition.definition.modules[0], projectInfo.projectDefinition.modules[0])
      printDiff(projectDiff)
      if (projectDiff.changed) {
        out.write(warnOverrideProjectFileMessage)
        // exits if there it no valid input
        await waitForInput()

        definition.set(projectInfo.projectDefinition)
        await definition.save(Object.keys(projectDiff.files))
        await env.setEnv(envName, {projectId, version: projectInfo.version})
        if (newProject) {
          env.setDefault(envName)
        }
        env.save()
        out.write(`\n\nPulled project with "${projectId}" and environment "${envName}"`)
      }
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

function waitForInput() {
  terminal.grabInput(true)

  return new Promise(resolve => {
    terminal.on('key', function (name) {
      if (name !== 'y') {
        process.exit(0)
      }
      terminal.grabInput(false)
      resolve()
    })
  })
}
