import test from 'ava'
import pullCommand from '../src/commands/pull'
import client from '../src/io/Client'
import { defaultVolume, project, projects, push } from './fixtures/new-mock-data'
import out from '../src/io/Out'
import fs, { reset } from '../src/io/fs'
import definition from '../src/io/ProjectDefinition/ProjectDefinition'
import env from '../src/io/Environment'
import config from '../src/io/GraphcoolRC'
import { vol } from 'memfs'
import pushCommand from '../src/commands/push'

const fetchMock = require('fetch-mock')
const debug = require('debug')('graphcool')

test.before(() => {
  client.mock(project)
  client.mock(projects)
  client.mock(push)
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

test('Push when project is already pulled', async t => {
  await pullCommand({
    projectId: 'citoe33ar0x6p0168xqrpxa5h'
  })

  out.clearTestOutput()

  await pushCommand({
    force: false,
    isDryRun: false,
    projectEnvironment: {
      projectId: 'citoe33ar0x6p0168xqrpxa5h',
      version: 4,
    },
    envName: 'dev'
  })

  const expectedOutput = `\
 [32m✔[39m Identical project definition, no action required.`

  const output = out.getTestOutput()

  t.is(output.trim(), expectedOutput.trim())
})

test('throw for older version', async t => {
  await t.throws(pushCommand({
      force: false,
      isDryRun: false,
      projectEnvironment: {
        projectId: 'citoe33ar0x6p0168xqrpxa5h',
        version: 3,
      },
      envName: 'dev'
    })
  )
})
