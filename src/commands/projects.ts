import {
  couldNotFetchProjectsMessage, graphcoolEnvironmentFileName,
} from '../utils/constants'
import { regionEnumToOption } from '../utils/utils'
import client from '../io/Client'
import env from '../io/Environment'
import out from '../io/Out'
import * as chalk from 'chalk'

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
      const projectEnvironment = env.getEnvironment(project.id)
      const envName = projectEnvironment ? projectEnvironment.envName : ''
      return [isCurrentProject ? '*' : ' ', `${project.alias || project.id}   `, project.name, regionEnumToOption(project.region), envName]
    })

    const tableHeader = [
      ['', chalk.bold('Project ID'), chalk.bold('Project Name'), chalk.bold('Region'), chalk.bold('Environment')],
    ]

    const output = table(tableHeader.concat(data), {
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
