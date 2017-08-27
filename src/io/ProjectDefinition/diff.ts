import * as chalk from 'chalk'
import * as concordance from 'concordance'
import concordanceOptions from '../../utils/concordance-options'
import { GraphcoolModule } from '../../types'
import {difference} from 'lodash'

export interface ModuleDiff {
  definition?: string
  files: {[fileName: string]: Diff}
}

export interface Diff {
  action: 'removed' | 'added' | 'updated'
  diff: string
}

export function diff(a: GraphcoolModule, b: GraphcoolModule): ModuleDiff {
  let moduleDiff: any = {}
  let files = {}

  if (a.content !== b.content) {
    moduleDiff.definition = fileDiff(a.content, b.content)
  }

  Object.keys(a.files).forEach(fileName => {
    const aFile = a.files[fileName]
    const bFile = b.files[fileName]

    if (aFile !== bFile) {
      files[fileName] = {
        diff: fileDiff(aFile, bFile || ''),
        action: bFile ? 'updated' : 'added'
      }
    }
  })

  // track removed files
  difference(Object.keys(b.files), Object.keys(a.files)).forEach(fileName => {
    const file = b.files[fileName]
    files[fileName] = {
      diff: fileDiff(file, ''),
      action: 'removed'
    }
  })

  moduleDiff.files = files

  return moduleDiff
}

export function printDiff(diff: ModuleDiff) {
  if (diff.definition) {
    console.log(`${chalk.bold('graphcool.yml')}`)
    console.log(diff.definition)
    console.log()
  }

  Object.keys(diff.files).forEach(fileName => {
    const fileDiff = diff.files[fileName]
    console.log(`${chalk.bold(fileName)}`)
    console.log(fileDiff)
    console.log()
  })
}

function fileDiff(a: string, b: string) {
  const localDescriptor = concordance.describe(a, concordanceOptions)
  const remoteDescriptor = concordance.describe(b, concordanceOptions)
  return concordance.diffDescriptors(localDescriptor, remoteDescriptor, concordanceOptions)
}
