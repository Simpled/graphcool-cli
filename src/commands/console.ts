import open = require('open')
import { consoleURL, notAuthenticatedMessage, openedConsoleMessage } from '../utils/constants'
import client from '../io/Client'
import config from '../io/GraphcoolRC'
import out from '../io/Out'


export interface ConsoleProps {
  projectId: string
}

export default async (props: ConsoleProps): Promise<void> => {

  const {token} = config
  if (!token) {
    throw new Error(notAuthenticatedMessage)
  }

  const projectInfo = await client.fetchProjectInfo(props.projectId)
  const url = projectInfo ? consoleURL(token, projectInfo.name) : consoleURL(token)

  open(url)
  out.write(openedConsoleMessage(projectInfo ? projectInfo.name : undefined))
}
