import * as chalk from 'chalk'
import * as _ from 'lodash'
import out from '../../io/Out'
import figures = require('figures')

const {terminal} = require('terminal-kit')

export default async function Selection(text: string, options: string[][]): Promise<number> {
  terminal.saveCursor()
  out.write(text)

  terminal.grabInput()
  terminal.hideCursor()

  let currentIndex = 0

  render(options, currentIndex)
  let resolved = false

  await new Promise(resolve => {
    terminal.on('key', async (name: string) => {
      if (!resolved) {
        currentIndex = await handleKeyEvent(name, currentIndex, options, resolve, text)
      }
    })
  })

  resolved = true

  return currentIndex
}

async function handleKeyEvent(name: string, currentIndex: number, options: string[][], callback: () => void, text: string): Promise<number> {
  switch (name) {
    case 'j':
    case 'DOWN': {
      currentIndex = (currentIndex + 1) % options.length
      rerender(options, currentIndex)
      break
    }
    case 'k':
    case 'UP': {
      currentIndex = (currentIndex + options.length - 1) % options.length
      rerender(options, currentIndex)
      break
    }
    case 'ENTER': {
      handleSelect(options, text)
      callback()
      break
    }
    case 'CTRL_C': {
      terminal.restoreCursor()
      terminal.eraseDisplayBelow()
      terminal.hideCursor(false)
      out.write('\n')
      process.exit()
    }
    default: {
      break
    }
  }

  return currentIndex
}

function handleSelect(options: string[][], text: string) {
  terminal.restoreCursor()
  terminal.eraseDisplayBelow()
  terminal.hideCursor(false)
  terminal.grabInput(false)
  terminal( '\n' ).eraseLineAfter.green(
    ""
  );

  // clear(options, text)
  out.write('\n')
}

function rerender(options: string[][], currentIndex: number): void {
  clear(options)
  render(options, currentIndex)
}

function clear(options: string[][], text?: string) {
  const textLines = text ? text.split(/\n/g).length - 1 : 0
  const lineCount = _.flatten(options).length - 1 + textLines
  terminal.up(lineCount)
  terminal.left(10000)
  terminal.eraseDisplayBelow()
}

function render(options: string[][], currentIndex: number) {
  const lines = _.chain(options)
    .map((ls, optionIndex) => ls.map((l, lineIndex) => (lineIndex === 0 && optionIndex === currentIndex) ? renderActiveLine(l) : renderLine(l)))
    .flatten()
    .join('\n')

  terminal(lines, currentIndex)
}

const renderLine = l => `    ${l}`
const renderActiveLine = l => `  ${chalk.blue(figures.pointer)} ${l}`
