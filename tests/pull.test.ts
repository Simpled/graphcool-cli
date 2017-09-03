import test from 'ava'
import pullCommand from '../src/commands/pull'
import client from '../src/io/Client'
import { defaultVolume, project, projects } from './fixtures/new-mock-data'
import out from '../src/io/Out'
import fs, { reset } from '../src/io/fs'
import definition from '../src/io/ProjectDefinition/ProjectDefinition'
import env from '../src/io/Environment'
import config from '../src/io/GraphcoolRC'
import { vol } from 'memfs'
import {pickBy} from 'lodash'

const fetchMock = require('fetch-mock')
const debug = require('debug')('graphcool')

test.before(() => {
  client.mock(project)
  client.mock(projects)
  fs.writeFileSync('test.out', '')
})

test.afterEach(() => {
  fetchMock.restore()
  out.clearTestOutput()
  reset()
  // reset in-memory representations
  config.unsetToken()
  definition.set(null)
  env.initEmptyEnvironment()
})


// CONTINUE: fix tests

test('Pull with a project id provided', async t => {
  await pullCommand({
    projectId: 'citoe33ar0x6p0168xqrpxa5h'
  })

  const output = out.getTestOutput()

  const expectedOutput = `\
Checking out new project...
[1m
Written to graphcool.yml[22m[1m
Written to ./types.graphql
[22m

Pulled project with id "citoe33ar0x6p0168xqrpxa5h" and environment "dev"
`
  t.is(output, expectedOutput)

  const json = pickBy(vol.toJSON(), (value, key) => {
    if (key && key.includes('test.out')) {
      return false
    }
    return true
  })
  t.deepEqual(json, defaultVolume)
})

test('Pull with an incorrect project id throws', async t => {
  await t.throws(pullCommand({
      projectId: 'aitoe33ar0x8p0168xqrpxa52'
    })
  )
})

test('Pull can be executed again', async t => {
  await pullCommand({
    projectId: 'citoe33ar0x6p0168xqrpxa5h'
  })
  await pullCommand({
    projectId: 'citoe33ar0x6p0168xqrpxa5h'
  })

  const expectedOutput = `\
Checking out new project...
[1m
Written to graphcool.yml[22m[1m
Written to ./types.graphql
[22m

Pulled project with id "citoe33ar0x6p0168xqrpxa5h" and environment "dev"
Already up-to-date.`

  const output = out.getTestOutput()
  // require('fs').writeFileSync('test_.out', out.getTestOutput())

  t.is(output.trim(), expectedOutput.trim())
})
