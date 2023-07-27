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
import { createFeathersKoaApp } from '../../createApp'
import LocalStorage from '../storageprovider/local.storage'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { projectsRootFolder } from './file-browser.class'

const TEST_PROJECT = 'test-project'
const PROJECT_PATH = path.join(projectsRootFolder, TEST_PROJECT)
let STORAGE_PATH = ''
let STORAGE_ROOT = ''

describe('file browser service', () => {
  let app: Application
  before(async () => {
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
    const service = await app.service('file-browser')
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

    assert(result === true)

    assert(fs.existsSync(path.join(projectsRootFolder, dirName)))
    assert(fs.existsSync(path.join(STORAGE_ROOT, dirName)))

    fs.rmdirSync(path.join(projectsRootFolder, dirName))
    fs.rmdirSync(path.join(STORAGE_ROOT, dirName))

    // If name starts with '/'
    result = await app.service('file-browser').create('/' + dirName)

    assert(result === true)

    assert(fs.existsSync(path.join(projectsRootFolder, dirName)))
    assert(fs.existsSync(path.join(STORAGE_ROOT, dirName)))

    fs.rmdirSync(path.join(projectsRootFolder, dirName))
    fs.rmdirSync(path.join(STORAGE_ROOT, dirName))
  })

  describe('update service', () => {
    it('copies file', async () => {
      const fileName = 'Update_Service_Copy_File_Test_' + Math.round(Math.random() * 100) + '.txt'
      const newFileName = 'Update_Service_Copy_File_Test_' + Math.round(Math.random() * 1000) + '.txt'
      fs.writeFileSync(path.join(PROJECT_PATH, fileName), 'Hello world')
      fs.writeFileSync(path.join(STORAGE_PATH, fileName), 'Hello world')

      const result = await app.service('file-browser').update(null, {
        oldName: fileName,
        newName: newFileName,
        oldPath: TEST_PROJECT,
        newPath: TEST_PROJECT,
        isCopy: true
      })

      assert(result === true)

      assert(fs.existsSync(path.join(PROJECT_PATH, fileName)), 'Old file should not be removed on copy')
      assert(fs.existsSync(path.join(STORAGE_PATH, fileName)), 'Old file should not be removed on copy')

      assert(fs.existsSync(path.join(PROJECT_PATH, newFileName)))
      assert(fs.existsSync(path.join(STORAGE_PATH, newFileName)))

      fs.unlinkSync(path.join(PROJECT_PATH, fileName))
      fs.unlinkSync(path.join(STORAGE_PATH, fileName))
      fs.unlinkSync(path.join(PROJECT_PATH, newFileName))
      fs.unlinkSync(path.join(STORAGE_PATH, newFileName))
    })

    it('copies directory', async () => {
      const dir = 'Update_Service_Copy_Dir_' + Math.round(Math.random() * 100)
      const newDirName = 'Update_Service_Copy_Dir_' + Math.round(Math.random() * 1000) + '.txt'
      const fileName = 'Update_Service_Copy_Dir_Test_File_' + Math.round(Math.random() * 100) + '.txt'

      const dirPath = path.join(PROJECT_PATH, dir)
      const dirStoragePath = path.join(STORAGE_PATH, dir)
      const dirFilePath = path.join(dirPath, fileName)
      const dirFileStoragePath = path.join(dirStoragePath, fileName)
      const newDirPath = path.join(PROJECT_PATH, newDirName)
      const nweDirStoragePath = path.join(STORAGE_PATH, newDirName)

      fs.mkdirSync(dirPath)
      fs.mkdirSync(dirStoragePath)
      fs.writeFileSync(dirFilePath, 'Hello world')
      fs.writeFileSync(dirFileStoragePath, 'Hello world')

      const result = await app.service('file-browser').update(null, {
        oldName: dir,
        newName: newDirName,
        oldPath: TEST_PROJECT,
        newPath: TEST_PROJECT,
        isCopy: true
      })

      assert(result === true)

      assert(fs.existsSync(dirPath), 'Old directory should not be removed on copy')
      assert(fs.existsSync(dirStoragePath), 'Old directory should not be removed on copy')
      assert(fs.existsSync(dirFilePath), 'Old file should not be removed on copy')
      assert(fs.existsSync(dirFileStoragePath), 'Old file should not be removed on copy')

      assert(fs.existsSync(newDirPath) && fs.lstatSync(newDirPath).isDirectory())
      assert(fs.existsSync(nweDirStoragePath) && fs.lstatSync(nweDirStoragePath).isDirectory())
      assert(fs.existsSync(path.join(newDirPath, fileName)))
      assert(fs.existsSync(path.join(nweDirStoragePath, fileName)))

      fs.rmSync(dirPath, { force: true, recursive: true })
      fs.rmSync(dirStoragePath, { force: true, recursive: true })
      fs.rmSync(newDirPath, { force: true, recursive: true })
      fs.rmSync(nweDirStoragePath, { force: true, recursive: true })
    })

    it('moves file', async () => {
      const fileName = 'Update_Service_Move_File_Test+' + Math.round(Math.random() * 100) + '.txt'
      const newFileName = 'Update_Service_Move_File_Test_' + Math.round(Math.random() * 1000) + '.txt'
      fs.writeFileSync(path.join(PROJECT_PATH, fileName), 'Hello world')
      fs.writeFileSync(path.join(STORAGE_PATH, fileName), 'Hello world')

      const result = await app.service('file-browser').update(null, {
        oldName: fileName,
        newName: newFileName,
        oldPath: TEST_PROJECT,
        newPath: TEST_PROJECT
      })

      assert(result === true)

      assert(!fs.existsSync(path.join(PROJECT_PATH, fileName)), 'Old file should not exist on move')
      assert(!fs.existsSync(path.join(STORAGE_PATH, fileName)), 'Old file should not exist on move')

      assert(fs.existsSync(path.join(PROJECT_PATH, newFileName)))
      assert(fs.existsSync(path.join(STORAGE_PATH, newFileName)))

      fs.unlinkSync(path.join(PROJECT_PATH, newFileName))
      fs.unlinkSync(path.join(STORAGE_PATH, newFileName))
    })

    it('moves directory', async () => {
      const dir = 'Update_Service_Move_Dir_' + Math.round(Math.random() * 100)
      const newDirName = 'Update_Service_Move_Dir_' + Math.round(Math.random() * 1000) + '.txt'
      const fileName = 'Update_Service_Move_Dir_Test_File_' + Math.round(Math.random() * 100) + '.txt'

      const dirPath = path.join(PROJECT_PATH, dir)
      const dirStoragePath = path.join(STORAGE_PATH, dir)
      const dirFilePath = path.join(dirPath, fileName)
      const dirFileStoragePath = path.join(dirStoragePath, fileName)
      const newDirPath = path.join(PROJECT_PATH, newDirName)
      const nweDirStoragePath = path.join(STORAGE_PATH, newDirName)

      fs.mkdirSync(dirPath)
      fs.mkdirSync(dirStoragePath)
      fs.writeFileSync(dirFilePath, 'Hello world')
      fs.writeFileSync(dirFileStoragePath, 'Hello world')

      const result = await app.service('file-browser').update(null, {
        oldName: dir,
        newName: newDirName,
        oldPath: TEST_PROJECT,
        newPath: TEST_PROJECT
      })

      assert(result === true)

      assert(!fs.existsSync(dirPath), 'Old directory should not exists on Move')
      assert(!fs.existsSync(dirStoragePath), 'Old directory should not exists on Move')
      assert(!fs.existsSync(dirFilePath), 'Old file should not exists on Move')
      assert(!fs.existsSync(dirFileStoragePath), 'Old file should not exists on Move')

      assert(fs.existsSync(newDirPath) && fs.lstatSync(newDirPath).isDirectory())
      assert(fs.existsSync(nweDirStoragePath) && fs.lstatSync(nweDirStoragePath).isDirectory())
      assert(fs.existsSync(path.join(newDirPath, fileName)))
      assert(fs.existsSync(path.join(nweDirStoragePath, fileName)))

      fs.rmSync(newDirPath, { force: true, recursive: true })
      fs.rmSync(nweDirStoragePath, { force: true, recursive: true })
    })

    it('increment file name if file already exists', async () => {
      const fileName = 'Update_Service_File_Name_Increment_Test.txt'
      const incrementedFileName = 'Update_Service_File_Name_Increment_Test(1).txt'
      const incrementedFileName_2 = 'Update_Service_File_Name_Increment_Test(2).txt'
      fs.writeFileSync(path.join(PROJECT_PATH, fileName), 'Hello world')
      fs.writeFileSync(path.join(STORAGE_PATH, fileName), 'Hello world')

      const result = await app.service('file-browser').update(null, {
        oldName: fileName,
        newName: fileName,
        oldPath: TEST_PROJECT,
        newPath: TEST_PROJECT,
        isCopy: true
      })

      assert(result === true)

      assert(fs.existsSync(path.join(PROJECT_PATH, incrementedFileName)))
      assert(fs.existsSync(path.join(STORAGE_PATH, incrementedFileName)))

      await app.service('file-browser').update(null, {
        oldName: fileName,
        newName: fileName,
        oldPath: TEST_PROJECT,
        newPath: TEST_PROJECT,
        isCopy: true
      })

      assert(fs.existsSync(path.join(PROJECT_PATH, incrementedFileName_2)))
      assert(fs.existsSync(path.join(STORAGE_PATH, incrementedFileName_2)))

      fs.unlinkSync(path.join(PROJECT_PATH, fileName))
      fs.unlinkSync(path.join(STORAGE_PATH, fileName))
      fs.unlinkSync(path.join(PROJECT_PATH, incrementedFileName))
      fs.unlinkSync(path.join(STORAGE_PATH, incrementedFileName))
      fs.unlinkSync(path.join(PROJECT_PATH, incrementedFileName_2))
      fs.unlinkSync(path.join(STORAGE_PATH, incrementedFileName_2))
    })
  })

  it('patch file with new data', async () => {
    const fileName = 'Patch_Service_File_Test_' + Math.round(Math.random() * 100) + '.txt'
    const filePath = path.join(PROJECT_PATH, fileName)
    const fileStoragePath = path.join(STORAGE_PATH, fileName)
    const newData = 'New Data ' + Math.random()

    fs.writeFileSync(filePath, 'Hello world')
    fs.writeFileSync(fileStoragePath, 'Hello world')

    const result = await app.service('file-browser').patch(null, {
      fileName,
      path: TEST_PROJECT,
      body: Buffer.from(newData, 'utf-8'),
      contentType: 'any'
    })

    assert.equal(result, `https://${getStorageProvider().cacheDomain}/${path.join(TEST_PROJECT, fileName)}`)

    assert(fs.existsSync(filePath))
    assert(fs.existsSync(fileStoragePath))

    assert(fs.readFileSync(filePath).toString() === newData)
    assert(fs.readFileSync(fileStoragePath).toString() === newData)

    fs.unlinkSync(path.join(PROJECT_PATH, fileName))
    fs.unlinkSync(path.join(STORAGE_PATH, fileName))
  })

  describe('remove service', () => {
    it('removes file', async () => {
      const fileName = 'Remove_Service_File_Test_' + Math.round(Math.random() * 100) + '.txt'
      const filePath = path.join(PROJECT_PATH, fileName)
      const fileStoragePath = path.join(STORAGE_PATH, fileName)

      fs.writeFileSync(filePath, 'Hello world')
      fs.writeFileSync(fileStoragePath, 'Hello world')

      await app.service('static-resource').create(
        {
          mimeType: 'txt',
          hash: 'abcd',
          key: filePath
        },
        {
          isInternal: true
        }
      )

      const result = await app.service('file-browser').remove(path.join(TEST_PROJECT, fileName))

      result.forEach((r) => assert(r === true))

      const staticResource = await app.service('static-resource').find({
        query: {
          key: filePath,
          $limit: 1
        }
      })

      assert(!fs.existsSync(filePath))
      assert(!fs.existsSync(fileStoragePath))
      assert.notEqual(staticResource.total, 1)
    })

    it('removes dir recursively', async () => {
      const dirName = 'Remove_Service_Dir_Test_' + Math.round(Math.random() * 100) + '.txt'
      const fileName = 'Remove_Service_Dir_File_Test_' + Math.round(Math.random() * 100) + '.txt'
      const subdirName = 'Remove_Service_Dir_Subdir_Test_' + Math.round(Math.random() * 100)
      const dirPath = path.join(PROJECT_PATH, dirName)
      const dirStoragePath = path.join(STORAGE_PATH, dirName)

      fs.mkdirSync(dirPath)
      fs.mkdirSync(dirStoragePath)

      fs.mkdirSync(path.join(dirPath, subdirName))
      fs.mkdirSync(path.join(dirStoragePath, subdirName))

      fs.writeFileSync(path.join(dirPath, fileName), 'Hello world')
      fs.writeFileSync(path.join(dirStoragePath, fileName), 'Hello world')

      fs.writeFileSync(path.join(dirPath, subdirName, fileName), 'Hello world in sub directory')
      fs.writeFileSync(path.join(dirStoragePath, subdirName, fileName), 'Hello world sub directory')

      const result = await app.service('file-browser').remove(path.join(TEST_PROJECT, dirName))

      result.forEach((r) => assert(r === true))

      assert(!fs.existsSync(dirPath))
      assert(!fs.existsSync(dirStoragePath))
      assert(!fs.existsSync(path.join(dirPath, subdirName)))
      assert(!fs.existsSync(path.join(dirStoragePath, subdirName)))
      assert(!fs.existsSync(path.join(dirPath, subdirName, fileName)))
      assert(!fs.existsSync(path.join(dirStoragePath, subdirName, fileName)))
      assert(!fs.existsSync(path.join(dirPath, fileName)))
      assert(!fs.existsSync(path.join(dirStoragePath, fileName)))
    })
  })

  after(() => {
    fs.rmSync(PROJECT_PATH, { force: true, recursive: true })
    fs.rmSync(STORAGE_PATH, { force: true, recursive: true })
  })
})
