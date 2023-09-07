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
import fs from 'fs'
import path from 'path/posix'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { createFeathersKoaApp } from '../../createApp'
import LocalStorage from '../storageprovider/local.storage'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { projectsRootFolder } from './file-browser.class'

const TEST_PROJECT = 'test-project'
const PROJECT_PATH = path.join(projectsRootFolder, TEST_PROJECT)
let STORAGE_PATH = ''
let STORAGE_ROOT = ''

const getRandomizedName = (name: string, suffix = '', prefix = 'test') =>
  `${prefix}-${name}-${(Math.random() + 1).toString(36).substring(7)}${suffix}`

/**appends trailing `/` for directory paths */
const getDirectoryPath = (name: string) => name + '/'

describe('file browser service', () => {
  describe('s3 storage provider', () => {
    let app: Application
    before(async () => {
      app = createFeathersKoaApp()
      await app.setup()
    })
    after(() => {
      return destroyEngine()
    })

    it('should register the service', () => {
      const service = app.service('file-browser')
      assert.ok(service, 'Registered the service')
    })

    it('find service', () => {
      assert.doesNotThrow(async () => await app.service('file-browser').find())
    })

    let testDirectoryName: string
    it('creates a directory', async () => {
      testDirectoryName = getRandomizedName('directory')

      const createdDirectory = await app.service('file-browser').create(testDirectoryName)
      assert.ok(createdDirectory)
    })

    it('gets the directory', async () => {
      const foundDirectories = await app.service('file-browser').get(getDirectoryPath(testDirectoryName))
      assert.equal(foundDirectories.total, 0)
    })

    let testFileFullName: string
    let testFileName: string
    it('creates a file', async () => {
      testFileFullName = getRandomizedName('file', '.txt')
      testFileName = testFileFullName.split('.')[0]

      const newData = getRandomizedName('new data')

      const createdURL = await app.service('file-browser').patch(null, {
        fileName: testFileFullName,
        path: testDirectoryName,
        body: Buffer.from(newData, 'utf-8'),
        contentType: 'any'
      })

      assert.ok(createdURL)

      const fileContentsResponse = await fetch(createdURL)
      const fileContents = await fileContentsResponse.text()

      assert.equal(fileContents, newData)
    })

    it('gets the file', async () => {
      const directoryContents = await app.service('file-browser').get(getDirectoryPath(testDirectoryName))
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

        await app.service('file-browser').patch(null, {
          fileName: testFileName2,
          path: testDirectoryName2,
          body: Buffer.from(newData2, 'utf-8'),
          contentType: 'any'
        })

        testFileName3 = getRandomizedName('file3', '.mdx')
        const newData3 = getRandomizedName('new data 3')

        await app.service('file-browser').patch(null, {
          fileName: testFileName3,
          path: testDirectoryName2,
          body: Buffer.from(newData3, 'utf-8'),
          contentType: 'any'
        })
      })

      it('copies file', async () => {
        const copyFileResult = await app.service('file-browser').update(null, {
          oldName: testFileName2,
          newName: testFileName2,
          oldPath: getDirectoryPath(testDirectoryName2),
          newPath: getDirectoryPath(testDirectoryName),
          isCopy: true
        })

        assert.ok(Array.isArray(copyFileResult) ? copyFileResult.length > 0 : copyFileResult)

        const directoryContents = await app.service('file-browser').get(getDirectoryPath(testDirectoryName))
        const foundFile = directoryContents.data.find((file) => file.key.match(testFileName2))

        assert.ok(foundFile)
      })

      it('copies directory', async () => {
        const copyDirectoryResult = await app.service('file-browser').update(null, {
          oldName: testDirectoryName,
          newName: testDirectoryName,
          oldPath: '',
          newPath: testDirectoryName2,
          isCopy: true
        })

        assert.ok(Array.isArray(copyDirectoryResult) ? copyDirectoryResult.length > 0 : copyDirectoryResult)

        const directoryContents = await app.service('file-browser').get(getDirectoryPath(testDirectoryName2))
        const foundDirectory = directoryContents.data.find((dir) => dir.name.match(testDirectoryName))
        assert.ok(foundDirectory)
      })

      it('moves file', async () => {
        const moveFileResult = await app.service('file-browser').update(null, {
          oldName: testFileName3,
          newName: testFileName3,
          oldPath: getDirectoryPath(testDirectoryName2),
          newPath: getDirectoryPath(testDirectoryName)
        })

        assert.ok(Array.isArray(moveFileResult) ? moveFileResult.length > 0 : moveFileResult)

        const toMovedDirectoryContents = await app.service('file-browser').get(getDirectoryPath(testDirectoryName))
        const foundFile = toMovedDirectoryContents.data.find((file) => file.key.match(testFileName3))

        assert.ok(foundFile)

        const fromMovedDirectoryContents = await app.service('file-browser').get(getDirectoryPath(testDirectoryName2))
        const notFoundFile = fromMovedDirectoryContents.data.find((file) => file.key.match(testFileName3))
        assert.ok(!notFoundFile)
      })

      it('moves directory', async () => {
        const copyDirectoryResult = await app.service('file-browser').update(null, {
          oldName: testDirectoryName2,
          newName: testDirectoryName2,
          oldPath: '',
          newPath: testDirectoryName
        })

        assert.ok(Array.isArray(copyDirectoryResult) ? copyDirectoryResult.length > 0 : copyDirectoryResult)

        const directoryContents = await app.service('file-browser').get(getDirectoryPath(testDirectoryName))
        const toMovedDirectoryContents = directoryContents.data.find((dir) => dir.name.match(testDirectoryName2))
        assert.ok(toMovedDirectoryContents)

        const fromMovedDirectoryContents = await app.service('file-browser').get('/')
        const notFoundDirectory = fromMovedDirectoryContents.data.find((dir) => dir.name.match(testDirectoryName2))
        assert.ok(!notFoundDirectory)
      })

      it('increment file name if file already exists', async () => {
        const copyDirectoryResult = await app.service('file-browser').update(null, {
          oldName: testFileFullName,
          newName: testFileFullName,
          oldPath: testDirectoryName,
          newPath: testDirectoryName,
          isCopy: true
        })

        assert.ok(Array.isArray(copyDirectoryResult) ? copyDirectoryResult.length > 0 : copyDirectoryResult)

        const directoryContents = await app.service('file-browser').get(getDirectoryPath(testDirectoryName))
        const foundIncrementedFile = directoryContents.data.filter(
          (file) => file.name.match(testFileName) && file.name.match('(1)')
        )

        assert.equal(foundIncrementedFile.length, 1)
      })

      it('updates file with new content', async () => {
        const newData = getRandomizedName('new data 2 updated')
        const updateResult = await app.service('file-browser').patch(null, {
          fileName: testFileName2,
          path: testDirectoryName,
          body: Buffer.from(newData, 'utf-8'),
          contentType: 'any'
        })
        assert.ok(updateResult)

        const testDirectoryContents = await app.service('file-browser').get(getDirectoryPath(testDirectoryName))
        const updatedFile = testDirectoryContents.data.find((file) => file.key.match(testFileName2))
        assert.ok(updatedFile)

        const updatedFileContents = await (await fetch(updatedFile.url)).text()
        assert.equal(updatedFileContents, newData)
      })
    })

    describe('remove service', () => {
      it('removes file', async () => {
        let directoryContents = await app.service('file-browser').get(getDirectoryPath(testDirectoryName))
        let foundFile = directoryContents.data.find((file) => file.key.match(testFileFullName))
        assert.ok(foundFile)
        const removeResult = await app.service('file-browser').remove(foundFile.key)
        assert.ok(removeResult)

        directoryContents = await app.service('file-browser').get(getDirectoryPath(testDirectoryName))
        foundFile = directoryContents.data.find((file) => file.key.match(testFileFullName))
        assert.ok(!foundFile)
      })

      it('removes directory', async () => {
        let directoryContents = await app.service('file-browser').get('/')
        let foundDirectory = directoryContents.data.find((dir) => dir.key.match(testDirectoryName))
        assert.ok(foundDirectory)

        const removeResult = await app.service('file-browser').remove(testDirectoryName)
        assert.ok(removeResult)

        directoryContents = await app.service('file-browser').get('/')
        foundDirectory = directoryContents.data.find((dir) => dir.key.match(testDirectoryName))
        assert.ok(!foundDirectory)
      })
    })
  })

  describe('local storage provider', () => {
    let app: Application
    before(async () => {
      config.server.storageProvider = 'local'
      app = createFeathersKoaApp()
      await app.setup()

      STORAGE_ROOT = (getStorageProvider() as LocalStorage).PATH_PREFIX
      STORAGE_PATH = path.join(STORAGE_ROOT, TEST_PROJECT)

      if (fs.existsSync(PROJECT_PATH)) fs.rmSync(PROJECT_PATH, { force: true, recursive: true })
      if (fs.existsSync(STORAGE_PATH)) fs.rmSync(STORAGE_PATH, { force: true, recursive: true })

      fs.mkdirSync(PROJECT_PATH)
      fs.mkdirSync(STORAGE_PATH)
    })
    after(() => {
      return destroyEngine()
    })

    it('should register the service', async () => {
      const service = app.service('file-browser')
      assert.ok(service, 'Registered the service')
    })

    it('find service', () => {
      assert.doesNotThrow(async () => await app.service('file-browser').find())
    })

    it('gets directory content list', async () => {
      const dirName = 'Get_Dir_Content_Test_' + Math.round(Math.random() * 100)
      const dirStoragePath = path.join(STORAGE_PATH, dirName)

      fs.mkdirSync(dirStoragePath)

      const fileNames = [
        'Get_Dir_Content_Test_File_1.txt',
        'Get_Dir_Content_Test_File_2.txt',
        'Get_Dir_Content_Test_File_3.txt',
        'Get_Dir_Content_Test_File_4.txt',
        'Get_Dir_Content_Test_File_5.txt'
      ]
      fileNames.forEach((n) => fs.writeFileSync(path.join(dirStoragePath, n), 'Hello world'))

      let result = await app.service('file-browser').get(path.join(TEST_PROJECT, dirName))
      result.data.forEach((r, i) => assert(r && r.key === path.join(TEST_PROJECT, dirName, fileNames[i])))

      // If name starts with '/'
      result = await app.service('file-browser').get('/' + path.join(TEST_PROJECT, dirName))
      result.data.forEach((r, i) => assert(r && r.key === path.join(TEST_PROJECT, dirName, fileNames[i])))

      fs.rmSync(dirStoragePath, { force: true, recursive: true })
    })

    it('create project directory service', async () => {
      const dirName = 'Test_Project_' + Math.round(Math.random() * 100)
      let result = await app.service('file-browser').create(dirName)

      assert(result)

      assert(fs.existsSync(path.join(STORAGE_ROOT, dirName)))

      fs.rmdirSync(path.join(STORAGE_ROOT, dirName))

      // If name starts with '/'
      result = await app.service('file-browser').create('/' + dirName)

      assert(result)
      assert(fs.existsSync(path.join(STORAGE_ROOT, dirName)))

      fs.rmdirSync(path.join(STORAGE_ROOT, dirName))
    })

    describe('update service', () => {
      it('copies file', async () => {
        const fileName = 'Update_Service_Copy_File_Test_' + Math.round(Math.random() * 100) + '.txt'
        const newFileName = 'Update_Service_Copy_File_Test_' + Math.round(Math.random() * 1000) + '.txt'
        fs.writeFileSync(path.join(STORAGE_PATH, fileName), 'Hello world')

        const result = await app.service('file-browser').update(null, {
          oldName: fileName,
          newName: newFileName,
          oldPath: TEST_PROJECT,
          newPath: TEST_PROJECT,
          isCopy: true
        })

        assert(result)

        assert(fs.existsSync(path.join(STORAGE_PATH, fileName)), 'Old file should not be removed on copy')

        assert(fs.existsSync(path.join(STORAGE_PATH, newFileName)))

        fs.unlinkSync(path.join(STORAGE_PATH, fileName))
        fs.unlinkSync(path.join(STORAGE_PATH, newFileName))
      })

      it('copies directory', async () => {
        const dir = 'Update_Service_Copy_Dir_' + Math.round(Math.random() * 100)
        const newDirName = 'Update_Service_Copy_Dir_' + Math.round(Math.random() * 1000) + '.txt'
        const fileName = 'Update_Service_Copy_Dir_Test_File_' + Math.round(Math.random() * 100) + '.txt'

        const dirStoragePath = path.join(STORAGE_PATH, dir)
        const dirFileStoragePath = path.join(dirStoragePath, fileName)
        const nweDirStoragePath = path.join(STORAGE_PATH, newDirName)

        fs.mkdirSync(dirStoragePath)
        fs.writeFileSync(dirFileStoragePath, 'Hello world')

        const result = await app.service('file-browser').update(null, {
          oldName: dir,
          newName: newDirName,
          oldPath: TEST_PROJECT,
          newPath: TEST_PROJECT,
          isCopy: true
        })

        assert(result)

        assert(fs.existsSync(dirStoragePath), 'Old directory should not be removed on copy')
        assert(fs.existsSync(dirFileStoragePath), 'Old file should not be removed on copy')

        assert(fs.existsSync(nweDirStoragePath) && fs.lstatSync(nweDirStoragePath).isDirectory())
        assert(fs.existsSync(path.join(nweDirStoragePath, fileName)))

        fs.rmSync(dirStoragePath, { force: true, recursive: true })
        fs.rmSync(nweDirStoragePath, { force: true, recursive: true })
      })

      it('moves file', async () => {
        const fileName = 'Update_Service_Move_File_Test+' + Math.round(Math.random() * 100) + '.txt'
        const newFileName = 'Update_Service_Move_File_Test_' + Math.round(Math.random() * 1000) + '.txt'
        fs.writeFileSync(path.join(STORAGE_PATH, fileName), 'Hello world')

        const result = await app.service('file-browser').update(null, {
          oldName: fileName,
          newName: newFileName,
          oldPath: TEST_PROJECT,
          newPath: TEST_PROJECT
        })

        assert(result)

        assert(!fs.existsSync(path.join(STORAGE_PATH, fileName)), 'Old file should not exist on move')

        assert(fs.existsSync(path.join(STORAGE_PATH, newFileName)))

        fs.unlinkSync(path.join(STORAGE_PATH, newFileName))
      })

      it('moves directory', async () => {
        const dir = 'Update_Service_Move_Dir_' + Math.round(Math.random() * 100)
        const newDirName = 'Update_Service_Move_Dir_' + Math.round(Math.random() * 1000) + '.txt'
        const fileName = 'Update_Service_Move_Dir_Test_File_' + Math.round(Math.random() * 100) + '.txt'

        const dirStoragePath = path.join(STORAGE_PATH, dir)
        const dirFileStoragePath = path.join(dirStoragePath, fileName)
        const nweDirStoragePath = path.join(STORAGE_PATH, newDirName)

        fs.mkdirSync(dirStoragePath)
        fs.writeFileSync(dirFileStoragePath, 'Hello world')

        const result = await app.service('file-browser').update(null, {
          oldName: dir,
          newName: newDirName,
          oldPath: TEST_PROJECT,
          newPath: TEST_PROJECT
        })

        assert(result)

        assert(!fs.existsSync(dirStoragePath), 'Old directory should not exists on Move')
        assert(!fs.existsSync(dirFileStoragePath), 'Old file should not exists on Move')

        assert(fs.existsSync(nweDirStoragePath) && fs.lstatSync(nweDirStoragePath).isDirectory())
        assert(fs.existsSync(path.join(nweDirStoragePath, fileName)))

        fs.rmSync(nweDirStoragePath, { force: true, recursive: true })
      })

      it('increment file name if file already exists', async () => {
        const fileName = 'Update_Service_File_Name_Increment_Test.txt'
        const incrementedFileName = 'Update_Service_File_Name_Increment_Test(1).txt'
        const incrementedFileName_2 = 'Update_Service_File_Name_Increment_Test(2).txt'
        fs.writeFileSync(path.join(STORAGE_PATH, fileName), 'Hello world')

        const result = await app.service('file-browser').update(null, {
          oldName: fileName,
          newName: fileName,
          oldPath: TEST_PROJECT,
          newPath: TEST_PROJECT,
          isCopy: true
        })

        assert(result)

        assert(fs.existsSync(path.join(STORAGE_PATH, incrementedFileName)))

        await app.service('file-browser').update(null, {
          oldName: fileName,
          newName: fileName,
          oldPath: TEST_PROJECT,
          newPath: TEST_PROJECT,
          isCopy: true
        })

        assert(fs.existsSync(path.join(STORAGE_PATH, incrementedFileName_2)))

        fs.unlinkSync(path.join(STORAGE_PATH, fileName))
        fs.unlinkSync(path.join(STORAGE_PATH, incrementedFileName))
        fs.unlinkSync(path.join(STORAGE_PATH, incrementedFileName_2))
      })
    })

    it('patch file with new data', async () => {
      const fileName = 'Patch_Service_File_Test_' + Math.round(Math.random() * 100) + '.txt'
      const fileStoragePath = path.join(STORAGE_PATH, fileName)
      const newData = 'New Data ' + Math.random()

      fs.writeFileSync(fileStoragePath, 'Hello world')

      const result = await app.service('file-browser').patch(null, {
        fileName,
        path: TEST_PROJECT,
        body: Buffer.from(newData, 'utf-8'),
        contentType: 'any'
      })

      assert.equal(result, `https://${getStorageProvider().cacheDomain}/${path.join(TEST_PROJECT, fileName)}`)

      assert(fs.existsSync(fileStoragePath))

      assert.equal(fs.readFileSync(fileStoragePath).toString(), newData)

      fs.unlinkSync(path.join(STORAGE_PATH, fileName))
    })

    describe('remove service', () => {
      it('removes file', async () => {
        const fileName = 'Remove_Service_File_Test_' + Math.round(Math.random() * 100) + '.txt'
        const fileStoragePath = path.join(STORAGE_PATH, fileName)

        fs.writeFileSync(fileStoragePath, 'Hello world')

        const result = await app.service('file-browser').remove(path.join(TEST_PROJECT, fileName))

        result.forEach((r) => assert(r))

        assert(!fs.existsSync(fileStoragePath))
      })

      it('removes dir recursively', async () => {
        const dirName = 'Remove_Service_Dir_Test_' + Math.round(Math.random() * 100) + '.txt'
        const fileName = 'Remove_Service_Dir_File_Test_' + Math.round(Math.random() * 100) + '.txt'
        const subdirName = 'Remove_Service_Dir_Subdir_Test_' + Math.round(Math.random() * 100)
        const dirStoragePath = path.join(STORAGE_PATH, dirName)

        fs.mkdirSync(dirStoragePath)

        fs.mkdirSync(path.join(dirStoragePath, subdirName))

        fs.writeFileSync(path.join(dirStoragePath, fileName), 'Hello world')

        fs.writeFileSync(path.join(dirStoragePath, subdirName, fileName), 'Hello world sub directory')

        const result = await app.service('file-browser').remove(path.join(TEST_PROJECT, dirName))

        result.forEach((r) => assert(r))

        assert(!fs.existsSync(dirStoragePath))
        assert(!fs.existsSync(path.join(dirStoragePath, subdirName)))
        assert(!fs.existsSync(path.join(dirStoragePath, subdirName, fileName)))
        assert(!fs.existsSync(path.join(dirStoragePath, fileName)))
      })
    })

    after(() => {
      fs.rmSync(PROJECT_PATH, { force: true, recursive: true })
      fs.rmSync(STORAGE_PATH, { force: true, recursive: true })
    })
  })
})
