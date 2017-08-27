import {
  fetchingProjectDataMessage,
  warnOverrideProjectFileMessage
} from '../utils/constants'
import out from '../io/Out'
import { interactiveProjectSelection } from '../utils/projectSelection'
import { ProjectEnvironment } from '../types'
import definition from '../io/ProjectDefinition/ProjectDefinition'
import client from '../io/Client'
import { diff, printDiff } from '../io/ProjectDefinition/diff'
import { generateErrorOutput, parseErrors } from '../utils/errors'

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
  let projectInfo

  try {
    out.startSpinner(`${fetchingProjectDataMessage}`)
    projectInfo = await client.fetchProjectInfo(projectId)
    out.stopSpinner()
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

  if (definition.definition && !props.force) {
    printDiff(diff(definition.definition[0], projectInfo.projectDefinition[0]))
    out.write(warnOverrideProjectFileMessage)
    // exits if there it no valid input
    await waitForInput()
  }

  definition.set(projectInfo.projectDefinition)
  await definition.save()
  console.log(`Saved new project, environment name: ${envName}, project id: "${projectId}"`)
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
