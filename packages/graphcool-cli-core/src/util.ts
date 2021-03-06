import * as chalk from 'chalk'

export const consoleURL = (token: string, projectName?: string) =>
  `https://console.graph.cool/token?token=${token}${projectName ? `&redirect=/${encodeURIComponent(projectName)}` : ''}`
export const playgroundURL = (token: string, projectName: string) =>
  `https://console.graph.cool/token?token=${token}&redirect=/${encodeURIComponent(projectName)}/playground`

export const endpointsMessage = (projectId: string) => `\
The ${chalk.bold('endpoints')} for your project are:

  Simple API:         https://api.graph.cool/simple/v1/${projectId}
  Relay API:          https://api.graph.cool/relay/v1/${projectId}
  Subscriptions API:  wss://subscriptions.graph.cool/v1/${projectId}
  File API:           https://api.graph.cool/file/v1/${projectId}
`
