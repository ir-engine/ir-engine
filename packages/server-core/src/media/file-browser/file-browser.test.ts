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

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { fileBrowserPath } from '@etherealengine/engine/src/schemas/media/file-browser.schema'
import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'

const getRandomizedName = (name: string, suffix = '', prefix = 'test') =>
  `${prefix}-${name}-${(Math.random() + 1).toString(36).substring(7)}${suffix}`

/**appends trailing `/` for directory paths */
const getDirectoryPath = (name: string) => name + '/'

describe('file browser service', () => {
  let app: Application
  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
  })
  after(() => {
    return destroyEngine()
  })

  it('should register the service', () => {
    const service = app.service(fileBrowserPath)
    assert.ok(service, 'Registered the service')
  })

  it('find service', () => {
    assert.doesNotThrow(async () => await app.service(fileBrowserPath).get(''))
  })

  let testDirectoryName: string
  it('creates a directory', async () => {
    testDirectoryName = getRandomizedName('directory')

    const createdDirectory = await app.service(fileBrowserPath).create(testDirectoryName)
    assert.ok(createdDirectory)
  })

  it('gets the directory', async () => {
    const foundDirectories = await app
      .service(fileBrowserPath)
      .find({ query: { directory: getDirectoryPath(testDirectoryName) } })
    assert.equal(foundDirectories.total, 0)
  })

  let testFileFullName: string
  let testFileName: string
  it('creates a file', async () => {
    testFileFullName = getRandomizedName('file', '.txt')
    testFileName = testFileFullName.split('.')[0]

    const newData = getRandomizedName('new data')

    const createdURL = await app.service(fileBrowserPath).patch(null, {
      fileName: testFileFullName,
      path: testDirectoryName,
      body: Buffer.from(newData, 'utf-8'),
      contentType: 'any'
    })

    assert.ok(createdURL)
  })

  it('gets the file', async () => {
    const directoryContents = await app
      .service(fileBrowserPath)
      .find({ query: { directory: getDirectoryPath(testDirectoryName) } })
    const foundFile = directoryContents.data.find((file) => file.key.match(testFileFullName))

    assert.ok(foundFile)
  })

  describe('update service', () => {
    let testDirectoryName2: string
    let testFileName2: string
    let testFileName3: string
    before(async () => {
      testDirectoryName2 = getRandomizedName('directory2')

      testFileName2 = getRandomizedName('file2', '.md')
      const newData2 = getRandomizedName('new data 2')

      await app.service(fileBrowserPath).patch(null, {
        fileName: testFileName2,
        path: testDirectoryName2,
        body: Buffer.from(newData2, 'utf-8'),
        contentType: 'any'
      })

      testFileName3 = getRandomizedName('file3', '.mdx')
      const newData3 = getRandomizedName('new data 3')

      await app.service(fileBrowserPath).patch(null, {
        fileName: testFileName3,
        path: testDirectoryName2,
        body: Buffer.from(newData3, 'utf-8'),
        contentType: 'any'
      })
    })

    it('copies file', async () => {
      const copyFileResult = await app.service(fileBrowserPath).update(null, {
        oldName: testFileName2,
        newName: testFileName2,
        oldPath: getDirectoryPath(testDirectoryName2),
        newPath: getDirectoryPath(testDirectoryName),
        isCopy: true
      })

      assert.ok(Array.isArray(copyFileResult) ? copyFileResult.length > 0 : copyFileResult)

      const directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testDirectoryName) } })
      const foundFile = directoryContents.data.find((file) => file.key.match(testFileName2))

      assert.ok(foundFile)
    })

    it('copies directory', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(null, {
        oldName: testDirectoryName,
        newName: testDirectoryName,
        oldPath: '',
        newPath: testDirectoryName2,
        isCopy: true
      })

      assert.ok(Array.isArray(copyDirectoryResult) ? copyDirectoryResult.length > 0 : copyDirectoryResult)

      const directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testDirectoryName2) } })
      const foundDirectory = directoryContents.data.find((dir) => dir.name.match(testDirectoryName))
      assert.ok(foundDirectory)
    })

    it('moves file', async () => {
      const moveFileResult = await app.service(fileBrowserPath).update(null, {
        oldName: testFileName3,
        newName: testFileName3,
        oldPath: getDirectoryPath(testDirectoryName2),
        newPath: getDirectoryPath(testDirectoryName)
      })

      assert.ok(Array.isArray(moveFileResult) ? moveFileResult.length > 0 : moveFileResult)

      const toMovedDirectoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testDirectoryName) } })
      const foundFile = toMovedDirectoryContents.data.find((file) => file.key.match(testFileName3))

      assert.ok(foundFile)

      const fromMovedDirectoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testDirectoryName2) } })
      const notFoundFile = fromMovedDirectoryContents.data.find((file) => file.key.match(testFileName3))
      assert.ok(!notFoundFile)
    })

    it('moves directory', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(null, {
        oldName: testDirectoryName2,
        newName: testDirectoryName2,
        oldPath: '',
        newPath: testDirectoryName
      })

      assert.ok(Array.isArray(copyDirectoryResult) ? copyDirectoryResult.length > 0 : copyDirectoryResult)

      const directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testDirectoryName) } })
      const toMovedDirectoryContents = directoryContents.data.find((dir) => dir.name.match(testDirectoryName2))
      assert.ok(toMovedDirectoryContents)

      const fromMovedDirectoryContents = await app.service(fileBrowserPath).find({ query: { directory: '/' } })
      const notFoundDirectory = fromMovedDirectoryContents.data.find((dir) => dir.name.match(testDirectoryName2))
      assert.ok(!notFoundDirectory)
    })

    it('increment file name if file already exists', async () => {
      const copyDirectoryResult = await app.service(fileBrowserPath).update(null, {
        oldName: testFileFullName,
        newName: testFileFullName,
        oldPath: testDirectoryName,
        newPath: testDirectoryName,
        isCopy: true
      })

      assert.ok(Array.isArray(copyDirectoryResult) ? copyDirectoryResult.length > 0 : copyDirectoryResult)

      const directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testDirectoryName) } })
      const foundIncrementedFile = directoryContents.data.filter(
        (file) => file.name.match(testFileName) && file.name.match('(1)')
      )

      assert.equal(foundIncrementedFile.length, 1)
    })

    it('updates file with new content', async () => {
      const newData = getRandomizedName('new data 2 updated')
      const updateResult = await app.service(fileBrowserPath).patch(null, {
        fileName: testFileName2,
        path: testDirectoryName,
        body: Buffer.from(newData, 'utf-8'),
        contentType: 'any'
      })
      assert.ok(updateResult)

      const testDirectoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testDirectoryName) } })
      const updatedFile = testDirectoryContents.data.find((file) => file.key.match(testFileName2))
      assert.ok(updatedFile)
    })
  })

  describe('remove service', () => {
    it('removes file', async () => {
      let directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testDirectoryName) } })
      let foundFile = directoryContents.data.find((file) => file.key.match(testFileFullName))
      assert.ok(foundFile)
      const removeResult = await app.service(fileBrowserPath).remove(foundFile.key)
      assert.ok(removeResult)

      directoryContents = await app
        .service(fileBrowserPath)
        .find({ query: { directory: getDirectoryPath(testDirectoryName) } })
      foundFile = directoryContents.data.find((file) => file.key.match(testFileFullName))
      assert.ok(!foundFile)
    })

    it('removes directory', async () => {
      let directoryContents = await app.service(fileBrowserPath).find({ query: { directory: '/' } })
      let foundDirectory = directoryContents.data.find((dir) => dir.key.match(testDirectoryName))
      assert.ok(foundDirectory)

      const removeResult = await app.service(fileBrowserPath).remove(testDirectoryName)
      assert.ok(removeResult)

      directoryContents = await app.service(fileBrowserPath).find({ query: { directory: '/' } })
      foundDirectory = directoryContents.data.find((dir) => dir.key.match(testDirectoryName))
      assert.ok(!foundDirectory)
    })
  })
})
