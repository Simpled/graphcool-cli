import { defaultDefinition, howDoYouWantToGetStarted, sampleSchemaURL } from '../constants'
import * as chalk from 'chalk'
import { ProjectDefinition } from '../../types'
import Selection from './Selection'
import client from '../../io/Client'
import { ProjectSelection } from './ProjectSelection'
const {terminal} = require('terminal-kit')


export default async (): Promise<ProjectDefinition> => {
  const options = [
    [`${chalk.bold('New blank project')}`, `Creates a new Graphcool project from scratch.`, ''],
    [`${chalk.bold('Copying an existing project')}`, `Copies a project from your account`, ''],
    [`${chalk.bold('Based on example')}`, `Creates a new Graphcool project based on an example`, ''],
  ]

  const selectedIndex = await Selection(howDoYouWantToGetStarted(), options)

  switch (selectedIndex) {
    case 0: {
      return defaultDefinition
    }
    case 1: {
      const projectId = await ProjectSelection()
      const info = await client.fetchProjectInfo(projectId)
      return info.projectDefinition
    }
    case 2: {
      const examples = [
        [`${chalk.bold('Instagram')}`, `Contains an instagram clone with permission logic`, ''],
        [`${chalk.bold('Stripe Checkout')}`, `An example integrating the stripe checkout with schema extensions`, ''],
        [`${chalk.bold('Sendgrid Mails')}`, `An example that shows how to connect Graphcool to the Sendgrid API`, ''],
      ]
      const selectedExampleIndex = await Selection('Select an example', examples)
      // TODO: use the correct example here
      return defaultDefinition
    }
  }

  return defaultDefinition
}
