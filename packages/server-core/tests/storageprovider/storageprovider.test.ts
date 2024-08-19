/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import approot from 'app-root-path'
import assert from 'assert'
import fs from 'fs-extra'
import https from 'https'
import fetch from 'node-fetch'
import path from 'path/posix'
import { v4 as uuidv4 } from 'uuid'

import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'

import LocalStorage from '../../src/media/storageprovider/local.storage'
import S3Provider from '../../src/media/storageprovider/s3.storage'
import { getContentType } from '../../src/util/fileUtils'
import { providerAfterTest, providerBeforeTest } from './storageproviderconfig'

describe('storageprovider', () => {
  const testFileName = 'TestFile.txt'
  const testFolderName = `TestFolder-${uuidv4()}`
  const testFileContent = 'content'
  const folderKeyTemp = path.join(testFolderName, 'temp')
  const folderKeyTemp2 = path.join(testFolderName, 'temp2')

  const storageProviders = [] as any[]
  storageProviders.push(LocalStorage)
  if (
    process.env.STORAGE_S3_TEST_RESOURCE_BUCKET &&
    process.env.STORAGE_AWS_ACCESS_KEY_ID &&
    process.env.STORAGE_AWS_ACCESS_KEY_SECRET
  ) {
    storageProviders.push(S3Provider)
  }

  storageProviders.forEach((providerType) => {
    describe(`tests for ${providerType.name}`, () => {
      let provider
      let testRootPath

      const createTestDirectories = async () => {
        testRootPath = path.join(process.cwd(), 'packages', 'server', 'upload', testFolderName)
        await fs.ensureDir(testRootPath)
        await fs.ensureDir(path.join(testRootPath, 'temp'))
        await fs.ensureDir(path.join(testRootPath, 'temp2'))
        await fs.ensureDir(path.join(testRootPath, 'testDirectory'))
      }

      before(async function () {
        createEngine()
        provider = new providerType()
        await createTestDirectories()
        await providerBeforeTest(provider, testFolderName, folderKeyTemp, folderKeyTemp2)
      })

      it(`should put object in ${providerType.name}`, async function () {
        const fileKey = path.join(testFolderName, testFileName)
        const data = Buffer.from(testFileContent)
        await provider.putObject({
          Body: data,
          Key: fileKey,
          ContentType: getContentType(fileKey)
        })
      })

      it(`should have object in ${providerType.name}`, async function () {
        assert(await provider.doesExist(testFileName, testFolderName))
      })

      it(`should get object in ${providerType.name}`, async function () {
        const fileKey = path.join(testFolderName, testFileName)
        const file = await provider.getObject(fileKey)
        assert.ok(file.Body.toString() === testFileContent)
      })

      it(`should list object in ${providerType.name}`, async function () {
        const res = await provider.listFolderContent(testFolderName, true)

        let haveObject = false
        for (let i = 0; i < res.length; i++) {
          if (
            res[i].name === 'TestFile' &&
            res[i].type === 'txt' &&
            res[i].size === Buffer.byteLength(testFileContent)
          ) {
            haveObject = true
            break
          }
        }
        assert.ok(haveObject)
      })

      it(`should return valid object url in ${providerType.name}`, async function () {
        const fileKey = path.join('/', testFolderName, testFileName)
        const signedUrl = await provider.getSignedUrl(fileKey, 20000, [])
        const httpAgent = new https.Agent({
          rejectUnauthorized: false,
          timeout: 1000
        })
        let res
        try {
          res = await fetch(signedUrl.url + signedUrl.fields.key, { agent: httpAgent })
        } catch (err) {
          console.log(err)
        }
        if (!res) console.log('Make sure server is running')
        assert.ok(res?.ok)
      })

      // Unable to perform move/copy and rename test cases because Fleek storage doesn't implemented those methods

      it(`should be able to move/copy object in ${providerType.name}`, async function () {
        const newFolder1 = path.join(testFolderName, 'temp')
        const newFolder2 = path.join(testFolderName, 'temp2')

        //check copy functionality
        await provider.moveObject(testFileName, testFileName, testFolderName, newFolder1, true)
        assert(await provider.doesExist(testFileName, testFolderName))
        assert(await provider.doesExist(testFileName, newFolder1))

        //check move functionality
        await provider.moveObject(testFileName, testFileName, newFolder1, newFolder2, false)
        assert(await provider.doesExist(testFileName, newFolder2))
        assert(!(await provider.doesExist(testFileName, newFolder1)))
      })

      it(`should be able to rename object in ${providerType.name}`, async function () {
        const temp2Folder = path.join(testFolderName, 'temp2')
        await provider.moveObject(testFileName, 'Renamed.txt', testFolderName, temp2Folder, false)
        const res = await provider.listFolderContent(temp2Folder, true)

        assert.equal(res[0]?.name, 'Renamed')
      })

      it(`should delete object in ${providerType.name}`, async function () {
        const fileKey = path.join(testFolderName, testFileName)
        assert.ok(await provider.deleteResources([fileKey]))
      })

      it(`should put and get same data for glbs in ${providerType.name}`, async function () {
        const glbTestPath = 'packages/projects/default-project/assets/collisioncube.glb'
        const filePath = path.join(approot.path, glbTestPath)
        const fileData = fs.readFileSync(filePath)
        const contentType = getContentType(filePath)
        const key = path.join(testFolderName, glbTestPath)
        await provider.putObject({
          Body: fileData,
          Key: key,
          ContentType: contentType
        })
        const ret = await provider.getObject(key)
        assert.strictEqual(contentType, ret.ContentType)
        assert.deepStrictEqual(fileData, ret.Body)
      })

      it(`should put over 1000 objects in ${providerType.name}`, async function () {
        this.timeout(30000) // increase timeout to 30 seconds

        const batchSize = 100
        const totalObjects = 1010

        for (let i = 0; i < totalObjects; i += batchSize) {
          const promises: any[] = []
          for (let j = i; j < Math.min(i + batchSize, totalObjects); j++) {
            const fileKey = path.join(testFolderName, `${j}-${testFileName}`)
            const data = Buffer.from([])
            promises.push(
              provider.putObject({
                Body: data,
                Key: fileKey,
                ContentType: getContentType(fileKey)
              })
            )
          }
          await Promise.all(promises)
          await new Promise((resolve) => setTimeout(resolve, 100)) // Add a small delay between batches
        }
      })

      it(`should list over 1000 objects in ${providerType.name}`, async function () {
        const res = await provider.listFolderContent(testFolderName, true)
        assert(res.length > 1000)
      })

      it(`isDirectory: should correctly identify directories in ${providerType.name}`, async function () {
        const dirName = 'testDirectory'
        const dirPath = path.join(testRootPath, dirName)
        const fileName = `testFile-${uuidv4()}.txt`
        const filePath = path.join(dirPath, fileName)

        // create a directory
        await provider.putObject(
          {
            Key: dirPath,
            Body: Buffer.from(''),
            ContentType: 'application/x-directory'
          },
          { isDirectory: true }
        )

        // create a file inside the directory
        await provider.putObject({
          Body: Buffer.from('test content'),
          Key: filePath,
          ContentType: 'text/plain'
        })

        // test isDirectory
        assert(await provider.isDirectory(dirName, testRootPath), 'Should identify directory')
        assert(!(await provider.isDirectory(fileName, filePath)), 'Should not identify file as directory')
        assert(
          !(await provider.isDirectory('nonexistent', testFolderName)),
          'Should not identify non-existent path as directory'
        )
      })

      after(async function () {
        await destroyEngine()
        await providerAfterTest(provider, testFolderName)
        // clean up the test directory
        await fs.remove(testRootPath)
      })
    })
  })
})
