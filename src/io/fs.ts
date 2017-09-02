import * as nodeFs from 'fs'
import { fs as memfs, vol } from 'memfs'

if (process.env.NODE_ENV === 'test') {
  reset()
}

const fs = process.env.NODE_ENV === 'test' ? memfs : nodeFs

export default fs

export function reset() {
  vol.reset()
  vol.fromJSON({
    'test.out': ''
  }, process.cwd())
}
