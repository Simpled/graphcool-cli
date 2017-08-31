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

  await new Promise(resolve => {
    terminal.on('key', async (name: string) => {
      currentIndex = await handleKeyEvent(name, currentIndex, options, resolve)
    })
  })

  return currentIndex
}

async function handleKeyEvent(name: string, currentIndex: number, options: string[][], callback: () => void): Promise<number> {
  switch (name) {
    case 'DOWN': {
      currentIndex = (currentIndex + 1) % options.length
      rerender(options, currentIndex)
      break
    }
    case 'UP': {
      currentIndex = (currentIndex + options.length - 1) % options.length
      rerender(options, currentIndex)
      break
    }
    case 'ENTER': {
      handleSelect()
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

function handleSelect(): void {
  terminal.restoreCursor()
  terminal.eraseDisplayBelow()
  terminal.hideCursor(false)
  out.write('\n')
}

function rerender(options: string[][], currentIndex: number): void {
  clear(options)
  render(options, currentIndex)
}

function clear(options: string[][]) {
  const lineCount = _.flatten(options).length - 1
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
