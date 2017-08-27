import figures = require('figures')
import client from '../io/Client'
import { Project } from '../types'
const {terminal} = require('terminal-kit')
import {flatten, chain} from 'lodash'

export async function interactiveProjectSelection(): Promise<string> {
  const projects = await client.fetchProjects()
  terminal.saveCursor()
  terminal.grabInput()
  terminal.hideCursor()
  terminal(`\n`)

  let currentIndex = 0

  render(projects, currentIndex)

  const projectId = await new Promise<string>(resolve => {
    terminal.on('key', async (name: string) => {
      currentIndex = await handleKeyEvent(name, currentIndex, projects, resolve)
    })
  })

  return projectId
}

function rerender(projects: Project[], currentIndex: number): void {
  clear(projects)
  render(projects, currentIndex)
}

function clear(projects: Project[]) {
  const lineCount = flatten(projects).length - 1
  terminal.up(lineCount)
  terminal.left(10000)
  terminal.eraseDisplayBelow()
}

function render(projects: Project[], currentIndex: number) {

  const lines = chain(projects)
    .map(project => `${project.name} (${project.id})`)
    .map((l, lineIndex) => (lineIndex === currentIndex) ? `${figures.pointer} ${l}` : `  ${l}`)
    .join('\n')

  terminal(lines, currentIndex)
}

async function handleKeyEvent(name: string,
                              currentIndex: number,
                              projects: Project[],
                              callback: (projectId: string) => void): Promise<number> {

  switch (name) {
    case 'DOWN': {
      currentIndex = (currentIndex + 1) % projects.length
      rerender(projects, currentIndex)
      break
    }
    case 'UP': {
      currentIndex = (currentIndex + projects.length - 1) % projects.length
      rerender(projects, currentIndex)
      break
    }
    case 'ENTER': {
      clear(projects)
      terminal.hideCursor(false)
      terminal.grabInput(false)
      callback(projects[currentIndex].id)
      break
    }
    case 'CTRL_C': {
      clear(projects)
      terminal.hideCursor(false)
      terminal.grabInput(false)
      process.exit()
    }
    default: {
      break
    }
  }

  return currentIndex
}
