import {
  couldNotFetchProjectsMessage, graphcoolEnvironmentFileName,
} from '../utils/constants'
import { regionEnumToOption } from '../utils/utils'
import client from '../io/Client'
import env from '../io/Environment'
import out from '../io/Out'

const {table, getBorderCharacters} = require('table')
const debug = require('debug')('graphcool')

export interface ProjectsProps {

}

export default async (props: ProjectsProps): Promise<void> => {

  try {
    const projects = await client.fetchProjects()

    const currentProjectId = env.default ? env.default.projectId : null

    const data = projects.map(project => {
      const isCurrentProject = currentProjectId !== null && (currentProjectId === project.id || currentProjectId === project.alias)
      return [isCurrentProject ? '*' : ' ', `${project.alias || project.id}   `, project.name, regionEnumToOption(project.region)]
    })

    const output = table(data, {
      border: getBorderCharacters('void'),
      columnDefault: {
        paddingLeft: '0',
        paddingRight: '2',
      },
      drawHorizontalLine: () => false,
    }).trimRight()

    out.write(output)
  } catch (e) {
    throw new Error(`${couldNotFetchProjectsMessage} ${e.message}`)
  }

}
