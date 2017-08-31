import { MigrationActionType, MigrationErrorMessage, MigrationMessage } from '../types'
import { makePartsEnclodesByCharacterBold } from './utils'
import out from '../io/Out'
import figures = require('figures')
import * as chalk from 'chalk'

export function printMigrationMessages(migrationMessages: MigrationMessage[]) {
  migrationMessages.forEach((migrationMessage, index) => {
    const actionType = getMigrationActionType(migrationMessage.description)
    const symbol = getSymbolForMigrationActionType(actionType)
    const description = makePartsEnclodesByCharacterBold(migrationMessage.description, `\``)
    const outputMessage = `${index > 0 ? `  |` : ``}\n  | (${symbol})  ${description}\n`
    out.write(outputMessage)
    migrationMessage.subDescriptions!.forEach(subMessage => {
      const actionType = getMigrationActionType(subMessage.description)
      const symbol = getSymbolForMigrationActionType(actionType)
      const outputMessage = makePartsEnclodesByCharacterBold(subMessage.description, `\``)
      out.write(`  ├── (${symbol})  ${outputMessage}\n`)
    })
  })
}

function getMigrationActionType(message: string): MigrationActionType {
  if (message.indexOf('create') >= 0) {
    return 'create'
  } else if (message.indexOf('update') >= 0) {
    return 'update'
  } else if (message.indexOf('delete') >= 0 || message.indexOf('remove') >= 0) {
    return 'delete'
  }
  return 'unknown'
}

function getSymbolForMigrationActionType(type: MigrationActionType): string {
  switch (type) {
    case 'create': return '+'
    case 'delete': return '-'
    case 'update': return '*'
    case 'unknown': return '?'
  }
}


export function printMigrationErrors(errors: MigrationErrorMessage[]) {
  const indentation = spaces(2)
  errors.forEach(error => {
    const outputMessage = makePartsEnclodesByCharacterBold(error.description, `\``)
    out.write(`${indentation}${chalk.red(figures.cross)} ${outputMessage}\n`)
  })
}


const spaces = (n: number) => Array(n + 1).join(' ')
