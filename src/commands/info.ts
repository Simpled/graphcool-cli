import { endpointsMessage, infoMessage, noProjectIdMessage } from '../utils/constants'
import out from '../io/Out'
import { ProjectEnvironment, ProjectInfo } from '../types'
import client from '../io/Client'

export interface InfoProps {
  projectId: string
  projectEnvironment: ProjectEnvironment
  envName: string
}

export interface InfoCliProps {
  env?: string
}

export default async({projectId, projectEnvironment, envName}: InfoProps): Promise<void> => {

  if (!projectId) {
    throw new Error(noProjectIdMessage)
  }

  const info = await client.fetchProjectInfo(projectId)

  out.write(infoMessage(envName, projectEnvironment, info))
  out.write(endpointsMessage(projectId))
}
