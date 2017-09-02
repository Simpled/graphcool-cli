import * as chalk from 'chalk'
import * as concordance from 'concordance'
import concordanceOptions from '../../utils/concordance-options'
import { GraphcoolModule } from '../../types'
import {difference} from 'lodash'
import out from '../Out'

export interface ModuleDiff {
  files: {[fileName: string]: Diff}
  changed: boolean
}

export interface Diff {
  action: 'removed' | 'added' | 'updated'
  diff: string
}

export function diff(a: GraphcoolModule, b: GraphcoolModule): ModuleDiff {
  let moduleDiff: any = {}
  let files = {}
  let changed = false

  if (a.content !== b.content) {
    moduleDiff.definition = fileDiff(a.content, b.content)
    changed = true
    files['graphcool.yml'] = {
      diff: fileDiff(a.content, b.content || ''),
      action: 'updated'
    }
  }

  Object.keys(a.files).forEach(fileName => {
    const aFile = a.files[fileName]
    const bFile = b.files[fileName]

    if (aFile !== bFile) {
      files[fileName] = {
        diff: fileDiff(aFile, bFile || ''),
        action: bFile ? 'updated' : 'added'
      }
      changed = true
    }
  })

  // track removed files
  difference(Object.keys(b.files), Object.keys(a.files)).forEach(fileName => {
    const file = b.files[fileName]
    files[fileName] = {
      diff: fileDiff(file, ''),
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

      out.write(`${chalk.dim(fileName)}\n`)
      out.write(fileDiff.diff)
      out.write('\n\n')
    })
  } else {
    out.write('Already up-to-date.\n')
  }
}

function fileDiff(a: string, b: string) {
  const localDescriptor = concordance.describe(a, concordanceOptions)
  const remoteDescriptor = concordance.describe(b, concordanceOptions)
  return concordance.diffDescriptors(localDescriptor, remoteDescriptor, concordanceOptions)
}
