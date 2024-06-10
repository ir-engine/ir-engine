/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import assert from 'assert'

import { fileBrowserPath } from '@etherealengine/common/src/schemas/media/file-browser.schema'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import { getStorageProvider } from '../storageprovider/storageprovider'

const PREFIX = 'test'

const getRandomizedName = (name: string, suffix = '', prefix = PREFIX) =>
  `${prefix}-${name}-${(Math.random() + 1).toString(36).substring(7)}${suffix}`

/**prepends `projects` and appends `/` for directory paths */
const getDirectoryPath = (name: string) => 'projects/' + name + '/'

describe('file-browser.test', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })

  after(async () => {
    const directories = (await getStorageProvider().listFolderContent('projects/'))
      .map((directory) => directory.key)
      .filter((directory) => directory.startsWith('projects/test'))

    await Promise.all(directories.map((directory) => app.service(fileBrowserPath).remove(directory)))
  })

  after(() => {
    return destroyEngine()
  })

  it('find service', () => {
    assert.doesNotThrow(async () => await app.service(fileBrowserPath).get(''))
  })

  let testProjectName: string
  it('creates a directory', async () => {
    testProjectName = getRandomizedName('directory')

    const createdDirectory = await app.service(fileBrowserPath).create('projects/' + testProjectName)
    assert.ok(createdDirectory)
  })

  it('gets the directory', async () => {
    const foundDirectories = await app
      .service(fileBrowserPath)
      .find({ query: { directory: getDirectoryPath(testProjectName) } })
    assert.equal(foundDirectories.total, 0)
  })

  let testFileFullName: string
  let testFileName: string
  let testFileSize: number
  it('creates a file', async () => {
    testFileFullName = getRandomizedName('file', '.txt')
    testFileName = testFileFullName.split('.')[0]

    const newData = getRandomizedName('new data')
    const body = Buffer.from(newData, 'utf-8')
    testFileSize = Buffer.byteLength(body)

    const createdURL = await app.service(fileBrowserPath).patch(null, {
      project: testProjectName,
      path: testFileFullName,
      body,
      contentType: 'any'
    })

    assert.ok(createdURL)
  })

  it('gets the file', async () => {
    const directoryContents = await app
      .service(fileBrowserPath)
      .find({ query: { directory: getDirectoryPath(testProjectName) } })
    const foundFile = directoryContents.data.find((file) => file.key.match(testFileFullName))

    assert.ok(foundFile)
    assert.equal(foundFile.name, testFileName)
    assert.equal(foundFile.size, testFileSize)
    assert.equal(foundFile.url, getStorageProvider().getCachedURL(foundFile.key))
  })

  describe('update service', () => {
    let testProjectName2: string
    let testFileName2: string
    let testFileName3: string
    before(async () => {
      testProjectName2 = getRandomizedName('directory2')

      testFileName2 = getRandomizedName('file2', '.md')
      const newData2 = getRandomizedName('new data 2')

      await app.service(fileBrowserPath).patch(null, {
        project: testProjectName2,
        path: testFileName2,
        body: Buffer.from(newData2, 'utf-8'),
        contentType: 'any'
      })

      testFileName3 = getRandomizedName('file3', '.mdx')
      const newData3 = getRandomizedName('new data 3')

      await app.service(fileBrowserPath).patch(null, {
        project: testProjectName2,
        path: testFileName3,
        body: Buffer.from(newData3, 'utf-8'),
        contentType: 'any'
      })
    })

    it('copies file', async () => {
      const copyFileResult = await app.service(fileBrowserPath).update(null, {
        oldName: testFileName2,
        newName: testFileName2,
        oldPath: getDirectoryPath(testProjectName2),
        newPath: getDirectoryPath(testProjectName),
        isCopy: true
      })

      assert.ok(Array.isArray(copyFileResult) ? copyFileResult.length > 0 : copyFileResult)

      const directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testProjectName) } })
      const foundFile = directoryContents.data.find((file) => file.key.match(testFileName2))

      assert.ok(foundFile)
    })

    it('copies directory', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(null, {
        oldName: testProjectName,
        newName: testProjectName,
        oldPath: 'projects/',
        newPath: getDirectoryPath(testProjectName2),
        isCopy: true
      })

      assert.ok(Array.isArray(copyDirectoryResult) ? copyDirectoryResult.length > 0 : copyDirectoryResult)

      const directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testProjectName2) } })
      const foundDirectory = directoryContents.data.find((dir) => dir.name.match(testProjectName))
      assert.ok(foundDirectory)
    })

    it('moves file', async () => {
      const moveFileResult = await app.service(fileBrowserPath).update(null, {
        oldName: testFileName3,
        newName: testFileName3,
        oldPath: getDirectoryPath(testProjectName2),
        newPath: getDirectoryPath(testProjectName)
      })

      assert.ok(Array.isArray(moveFileResult) ? moveFileResult.length > 0 : moveFileResult)

      const toMovedDirectoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testProjectName) } })
      const foundFile = toMovedDirectoryContents.data.find((file) => file.key.match(testFileName3))

      assert.ok(foundFile)

      const fromMovedDirectoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testProjectName2) } })
      const notFoundFile = fromMovedDirectoryContents.data.find((file) => file.key.match(testFileName3))
      assert.ok(!notFoundFile)
    })

    it('moves directory', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(null, {
        oldName: testProjectName2,
        newName: testProjectName2,
        oldPath: 'projects/',
        newPath: getDirectoryPath(testProjectName)
      })

      assert.ok(Array.isArray(copyDirectoryResult) ? copyDirectoryResult.length > 0 : copyDirectoryResult)

      const directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testProjectName) } })
      const toMovedDirectoryContents = directoryContents.data.find((dir) => dir.name.match(testProjectName2))
      assert.ok(toMovedDirectoryContents)

      const fromMovedDirectoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testProjectName2) } })
      const notFoundDirectory = fromMovedDirectoryContents.data.find((dir) => dir.name.match(testProjectName2))
      assert.ok(!notFoundDirectory)
    })

    it('increment file name if file already exists', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(null, {
        oldName: testFileFullName,
        newName: testFileFullName,
        oldPath: getDirectoryPath(testProjectName),
        newPath: getDirectoryPath(testProjectName),
        isCopy: true
      })

      assert.ok(Array.isArray(copyDirectoryResult) ? copyDirectoryResult.length > 0 : copyDirectoryResult)

      const directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testProjectName) } })

      const foundIncrementedFile = directoryContents.data.filter(
        (file) => file.name.startsWith(testFileName) && file.name.endsWith('(1)')
      )
      assert.equal(foundIncrementedFile.length, 1)
    })

    it('updates file with new content', async () => {
      const newData = getRandomizedName('new data 2 updated')
      const updateResult = await app.service(fileBrowserPath).patch(null, {
        project: testProjectName,
        path: testFileName2,
        body: Buffer.from(newData, 'utf-8'),
        contentType: 'any'
      })
      assert.ok(updateResult)

      const testDirectoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testProjectName) } })
      const updatedFile = testDirectoryContents.data.find((file) => file.key.match(testFileName2))
      assert.ok(updatedFile)
    })

    it('filters entries using $like', async () => {
      const totalEntries = await app.service(fileBrowserPath).find({
        query: {
          directory: getDirectoryPath(testProjectName)
        }
      })

      const filteredEntries = await app.service(fileBrowserPath).find({
        query: {
          key: {
            $like: `%${PREFIX}%`
          },
          directory: getDirectoryPath(testProjectName)
        }
      })
      assert.ok(filteredEntries.data.length === totalEntries.data.length)

      const invalidSubstring = PREFIX + '$' // this substring is not present in any of the entries
      const emptyEntries = await app.service(fileBrowserPath).find({
        query: {
          key: {
            $like: `%${invalidSubstring}%`
          },
          directory: getDirectoryPath(testProjectName)
        }
      })
      assert.ok(emptyEntries.data.length === 0)
    })
  })

  describe('remove service', () => {
    it('removes file', async () => {
      let directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testProjectName) } })
      let foundFile = directoryContents.data.find((file) => file.key.match(testFileFullName))
      assert.ok(foundFile)
      const removeResult = await app.service(fileBrowserPath).remove(foundFile.key)
      assert.ok(removeResult)

      directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testProjectName) } })
      foundFile = directoryContents.data.find((file) => file.key.match(testFileFullName))
      assert.ok(!foundFile)
    })

    it('removes directory', async () => {
      let directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: 'projects/' + testProjectName } })
      let foundDirectory = directoryContents.data.find((dir) => dir.key.match(testProjectName))
      assert.ok(foundDirectory)

      const removeResult = await app.service(fileBrowserPath).remove(getDirectoryPath(testProjectName))
      assert.ok(removeResult)

      directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: 'projects/' + testProjectName } })
      foundDirectory = directoryContents.data.find((dir) => dir.key.match(testProjectName))
      assert.ok(!foundDirectory)
    })
  })
})
