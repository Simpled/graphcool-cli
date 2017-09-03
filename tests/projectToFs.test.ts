import test from 'ava'
import projectToFs from '../src/io/ProjectDefinition/projectToFs'
import fsToProject from '../src/io/ProjectDefinition/fsToProject'
import fs from '../src/io/fs'
import * as path from 'path'
import { defaultDefinition } from '../src/utils/constants'
import out from '../src/io/Out'

const projectToFsDir = path.join(process.cwd(), '/project-to-fs-test')
const fsToProjectDir = path.join(process.cwd(), '/fs-to-project-test')

test.before(async () => {
  fs.mkdirSync(fsToProjectDir)
  fs.mkdirSync(projectToFsDir)
  await projectToFs(defaultDefinition, fsToProjectDir)
})

test('fs to project', async t => {
  const definition = await fsToProject(fsToProjectDir)
  t.deepEqual(defaultDefinition, definition)
  const expectedOutput = `\
[1m
Written to graphcool.yml[22m[1m
Written to ./types.graphql
[22m[1m
Written to ./code/filter-posts.js
[22m[1m
Written to ./code/log-posts.js
[22m[1m
Written to ./code/log-posts.graphql
[22m[1m
Written to ./code/weather.js
[22m[1m
Written to ./code/weather.graphql
[22m`

  t.is(expectedOutput.trim(), out.getTestOutput().trim())
})
