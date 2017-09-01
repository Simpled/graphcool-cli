import test from 'ava'
import * as fs from 'fs'
import * as path from 'path'
import * as rimraf from 'rimraf'
import * as mkdirp from 'mkdirp'
import { mockFileNames, mockFiles, mockDefinition, changedMockDefinition } from './fixtures/mock_modules'
import projectToFs from '../src/io/ProjectDefinition/projectToFs'
import * as globby from 'globby'
import fsToProject from '../src/io/ProjectDefinition/fsToProject'

const projectToFsDir = path.join(__dirname, '/project-to-fs-test')
const projectToFsDirChanged = path.join(__dirname, '/project-to-fs-test-changed')
const fsToProjectDir = path.join(__dirname, '/fs-to-project-test')

test.before(async () => {
  mkdirp.sync(projectToFsDir)
  // mkdirp.sync(projectToFsDirChanged)
  mkdirp.sync(fsToProjectDir)
  await projectToFs(mockDefinition, fsToProjectDir)
})

test('fs to project', async t => {
  const definition = await fsToProject(fsToProjectDir)
  t.deepEqual(mockDefinition, definition)
})

// test('project to fs', async t => {
//   await projectToFs(mockDefinition, projectToFsDir)
//   const absoluteFileNames: string[] = await globby(projectToFsDir + '/**/*.*')
//   const fileNames = absoluteFileNames.map(f => f.slice(projectToFsDir.length, f.length))
//   const files = absoluteFileNames.map(fileName => fs.readFileSync(fileName, 'utf-8'))
//   console.log(fileNames)
//   t.is(1,1)
// })

test.after(() => {
  rimraf.sync(projectToFsDir)
  // rimraf.sync(projectToFsDirChanged)
  rimraf.sync(fsToProjectDir)
})