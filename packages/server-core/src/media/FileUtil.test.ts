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
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { copyRecursiveSync, getIncrementalName } from './FileUtil'
import { projectsRootFolder } from './file-browser/file-browser.class'
import LocalStorage from './storageprovider/local.storage'

const TEST_DIR = 'FileUtil-test-project'

describe('FileUtil functions', () => {
  let PROJECT_PATH: string
  let STORAGE_PATH: string
  let store: LocalStorage
  before(() => {
    createEngine()
    store = new LocalStorage()
    PROJECT_PATH = path.join(projectsRootFolder, TEST_DIR)
    STORAGE_PATH = path.join(store.PATH_PREFIX, TEST_DIR)
    if (fs.existsSync(PROJECT_PATH)) fs.rmSync(PROJECT_PATH, { force: true, recursive: true })

    fs.mkdirSync(PROJECT_PATH)
    fs.mkdirSync(STORAGE_PATH)
  })

  describe('copyRecursiveSync', () => {
    it('should not throw any error if path does not exists', () => {
      assert.doesNotThrow(() => {
        copyRecursiveSync(path.join(PROJECT_PATH, 'Test_Path'), path.join(PROJECT_PATH, 'Test_Path_2'))
      })
    })

    it('should make copy of given file path', () => {
      const fileName = 'FileUtil_Copy_File_Test_' + Math.round(Math.random() * 100) + '.txt'
      const newFileName = 'FileUtil_Copy_File_Test_' + Math.round(Math.random() * 1000) + '.txt'
      const filePath = path.join(PROJECT_PATH, fileName)
      const newFilePath = path.join(PROJECT_PATH, newFileName)
      fs.writeFileSync(filePath, 'Hello world')

      copyRecursiveSync(filePath, newFilePath)

      assert(fs.existsSync(filePath))
      assert(fs.existsSync(newFilePath))
      assert(fs.readFileSync(filePath).toString() === fs.readFileSync(newFilePath).toString())

      fs.unlinkSync(filePath)
      fs.unlinkSync(newFilePath)
    })

    it('should make copy of given dirctory path recursively', () => {
      const dirVersion = Math.round(Math.random() * 100)
      const dirName = 'FileUtil_Copy_Dir_Test_' + dirVersion
      const newDirName = 'FileUtil_Copy_Dir_Test_' + (dirVersion + 1)
      const subdirName = 'FileUtil_Copy_Dir_Subdir_Test_' + Math.round(Math.random() * 100)
      const fileName = 'FileUtil_Copy_File_Test_' + Math.round(Math.random() * 100) + '.txt'
      const dirPath = path.join(PROJECT_PATH, dirName)
      const newDirPath = path.join(PROJECT_PATH, newDirName)

      fs.mkdirSync(dirPath)
      fs.mkdirSync(path.join(dirPath, subdirName))

      fs.writeFileSync(path.join(dirPath, fileName), 'Hello world')
      fs.writeFileSync(path.join(dirPath, subdirName, fileName), 'Hello world')

      copyRecursiveSync(dirPath, newDirPath)

      assert(fs.existsSync(dirPath))
      assert(fs.existsSync(newDirPath))

      assert(fs.existsSync(path.join(dirPath, subdirName)))
      assert(fs.existsSync(path.join(newDirPath, subdirName)))

      assert(fs.existsSync(path.join(dirPath, fileName)))
      assert(fs.existsSync(path.join(newDirPath, fileName)))
      assert(
        fs.readFileSync(path.join(dirPath, fileName)).toString() ===
          fs.readFileSync(path.join(newDirPath, fileName)).toString()
      )

      assert(fs.existsSync(path.join(dirPath, subdirName, fileName)))
      assert(fs.existsSync(path.join(newDirPath, subdirName, fileName)))
      assert(
        fs.readFileSync(path.join(dirPath, subdirName, fileName)).toString() ===
          fs.readFileSync(path.join(newDirPath, subdirName, fileName)).toString()
      )

      fs.rmSync(dirPath, { force: true, recursive: true })
      fs.rmSync(newDirPath, { force: true, recursive: true })
    })
  })

  describe('getIncrementalName', () => {
    it('should return given name if provided path does not exist', async () => {
      const fileName = 'FileUtil_Incremental_Name_File_Test_' + Math.round(Math.random() * 100) + '.txt'
      assert((await getIncrementalName(fileName, TEST_DIR, store)) === fileName)
    })

    it('should return incremental name for file if it exist already', async () => {
      const fileName = 'FileUtil_Incremental_Name_File_Test.txt'
      const fileName_1 = 'FileUtil_Incremental_Name_File_Test(1).txt'
      const fileName_2 = 'FileUtil_Incremental_Name_File_Test(2).txt'

      fs.writeFileSync(path.join(STORAGE_PATH, fileName), 'Hello world')

      let name = await getIncrementalName(fileName, TEST_DIR, store)
      assert.equal(name, fileName_1)

      fs.writeFileSync(path.join(STORAGE_PATH, fileName_1), 'Hello world')
      name = await getIncrementalName(fileName, TEST_DIR, store)
      assert.equal(name, fileName_2)

      fs.unlinkSync(path.join(STORAGE_PATH, fileName))
      fs.unlinkSync(path.join(STORAGE_PATH, fileName_1))
    })

    it('should return incremental name for directory if it exist already', async () => {
      const dirName = 'FileUtil_Incremental_Name_Dir_Test'
      const dirName_1 = 'FileUtil_Incremental_Name_Dir_Test(1)'
      const dirName_2 = 'FileUtil_Incremental_Name_Dir_Test(2)'

      fs.mkdirSync(path.join(STORAGE_PATH, dirName))

      let name = await getIncrementalName(dirName, TEST_DIR, store, true)
      assert.equal(name, dirName_1)

      fs.mkdirSync(path.join(STORAGE_PATH, dirName_1))
      name = await getIncrementalName(dirName, TEST_DIR, store, true)
      assert.equal(name, dirName_2)

      fs.rmdirSync(path.join(STORAGE_PATH, dirName))
      fs.rmdirSync(path.join(STORAGE_PATH, dirName_1))
    })
  })

  after(() => {
    fs.rmSync(PROJECT_PATH, { force: true, recursive: true })
    fs.rmSync(STORAGE_PATH, { force: true, recursive: true })
    destroyEngine()
  })
})
