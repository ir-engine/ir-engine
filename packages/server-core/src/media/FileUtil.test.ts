import assert from 'assert'
import fs from 'fs'
import path from 'path/posix'

import { projectsRootFolder } from './file-browser/file-browser.class'
import { copyRecursiveSync, getIncrementalName } from './FileUtil'
import LocalStorage from './storageprovider/local.storage'

const TEST_DIR = 'FileUtil-test-project'
const store = new LocalStorage()
const PROJECT_PATH = path.join(projectsRootFolder, TEST_DIR)
const STORAGE_PATH = path.join(store.PATH_PREFIX, TEST_DIR)

describe('FileUtil functions', () => {
  before(() => {
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
  })
})
