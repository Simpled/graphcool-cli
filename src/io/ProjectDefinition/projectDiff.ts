import * as chalk from 'chalk'
import { GraphcoolModule } from '../../types'
import { difference } from 'lodash'
import out from '../Out'
import * as jsDiff from 'diff'
import { LineDiff } from '../../../typings/diff'

export interface ModuleDiff {
  files: {[fileName: string]: Diff}
  changed: boolean
}

export interface Diff {
  action: 'removed' | 'added' | 'updated'
  diff: LineDiff[]
}

export function diff(a: GraphcoolModule, b: GraphcoolModule): ModuleDiff {
  let moduleDiff: any = {}
  let files = {}
  let changed = false

  if (a.content !== b.content) {
    moduleDiff.definition = jsDiff.diffLines(a.content, b.content)
    changed = true
    files['graphcool.yml'] = {
      diff: jsDiff.diffLines(a.content, b.content || ''),
      action: 'updated'
    }
  }

  Object.keys(a.files).forEach(fileName => {
    const aFile = a.files[fileName]
    const bFile = b.files[fileName]

    if (aFile !== bFile) {
      files[fileName] = {
        diff: jsDiff.diffLines(aFile, bFile || ''),
        action: bFile ? 'updated' : 'added'
      }
      changed = true
    }
  })

  // track removed files
  difference(Object.keys(b.files), Object.keys(a.files)).forEach(fileName => {
    const file = b.files[fileName]
    files[fileName] = {
      diff: jsDiff.diffLines(file, ''),
      action: 'removed'
    }
    changed = true
  })

  moduleDiff.files = files
  moduleDiff.changed = changed

  return moduleDiff
}

export function printDiff(diff: ModuleDiff) {
  if (diff.changed) {
    out.write(chalk.bold('\nChanges since last pull:\n'))
    Object.keys(diff.files).forEach(fileName => {
      const fileDiff = diff.files[fileName]

      out.write(`${chalk.bold(fileName)}\n`)
      printLinesDiff(fileDiff.diff)
      out.write('\n')
    })
  } else {
    out.write('Already up-to-date.\n')
  }
}

function printLinesDiff(diff: LineDiff[]) {
  diff.forEach(line => {
    if (line.added) {
      out.write(chalk.green(`${prefixLines(line.value, '+ ', line.count)}`))
    } else if (line.removed) {
      out.write(chalk.red(`- ${prefixLines(line.value, '- ', line.count)}`))
    } else {
      out.write(chalk.dim(`${prefixLines(line.value, '  ', line.count)}`))
    }
  })
}

function prefixLines(text: string, prefix: string, count: number) {
  const lines = text.split('\n')
  return lines.slice(0, count).map(l => prefix + l).concat(lines.slice(count, lines.length)).join('\n')
}
