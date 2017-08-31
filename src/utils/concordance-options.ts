import * as ansiStyles from 'ansi-styles'
import * as chalk from 'chalk'

const forceColor = new chalk.constructor({enabled: true})

const colorTheme = {
  string: {
    open: ansiStyles.blue.open,
    close: ansiStyles.blue.close,
    line: {open: forceColor.blue('\''), close: forceColor.blue('\'')},
    controlPicture: ansiStyles.grey,
    diff: {
      insert: {
        open: ansiStyles.bgGreen.open + ansiStyles.black.open,
        close: ansiStyles.black.close + ansiStyles.bgGreen.close
      },
      delete: {
        open: ansiStyles.bgRed.open + ansiStyles.black.open,
        close: ansiStyles.black.close + ansiStyles.bgRed.close
      },
      equal: ansiStyles.blue,
      insertLine: {
        open: ansiStyles.green.open,
        close: ansiStyles.green.close
      },
      deleteLine: {
        open: ansiStyles.red.open,
        close: ansiStyles.red.close
      }
    }
  },
}

const concordanceOptions = {maxDepth: 2, plugins: [], theme: colorTheme}

export default concordanceOptions
