import assert from 'assert'
import fetch from 'node-fetch'
import path from 'path'
const https = require('https')
import S3Provider from '../../src/media/storageprovider/s3.storage'
import LocalStorage from '../../src/media/storageprovider/local.storage'
import { StorageProviderInterface } from '../../src/media/storageprovider/storageprovider.interface'
import { providerBeforeTest, providerAfterTest } from './storageproviderconfig'
import { getContentType } from '../../src/util/fileUtils'
import approot from 'app-root-path'
import fs from 'fs-extra'
import { v4 as uuid } from 'uuid'

describe('storageprovider', () => {
  const testFileName = 'TestFile.txt'
  const testFolderName = `TestFolder-${uuid()}`
  const testFileContent = 'content'
  const folderKeyTemp = path.join(testFolderName, 'temp')
  const folderKeyTemp2 = path.join(testFolderName, 'temp2')

  const storageProviders: StorageProviderInterface[] = []
  storageProviders.push(new LocalStorage())
  if (
    process.env.STORAGE_S3_TEST_RESOURCE_BUCKET &&
    process.env.STORAGE_AWS_ACCESS_KEY_ID &&
    process.env.STORAGE_AWS_ACCESS_KEY_SECRET
  ) {
    storageProviders.push(new S3Provider())
  }

  storageProviders.forEach((provider) => {
    before(async function () {
      await providerBeforeTest(provider, testFolderName, folderKeyTemp, folderKeyTemp2)
    })

    it(`should put object in ${provider.constructor.name}`, async function () {
      const fileKey = path.join(testFolderName, testFileName)
      const data = Buffer.from(testFileContent)
      await provider.putObject({
        Body: data,
        Key: fileKey,
        ContentType: getContentType(fileKey)
      })
    })

    it(`should have object in ${provider.constructor.name}`, async function () {
      const fileKey = path.join(testFolderName, testFileName)
      await assert.rejects(provider.checkObjectExistence(fileKey))
    })

    it(`should get object in ${provider.constructor.name}`, async function () {
      const fileKey = path.join(testFolderName, testFileName)
      const file = await provider.getObject(fileKey)
      assert.ok(file.Body.toString() === testFileContent)
    })

    it(`should list object in ${provider.constructor.name}`, async function () {
      const res = await provider.listFolderContent(testFolderName, true)

      let haveObject = false
      for (let i = 0; i < res.length; i++) {
        if (res[i].name === 'TestFile' && res[i].type === 'txt') {
          haveObject = true
          break
        }
      }
      assert.ok(haveObject)
    })

    it(`should return valid object url in ${provider.constructor.name}`, async function () {
      const fileKey = path.join('/', testFolderName, testFileName)
      const signedUrl = await provider.getSignedUrl(fileKey, 20000, [])
      const httpAgent = new https.Agent({
        rejectUnauthorized: false
      })
      let res
      try {
        res = await fetch(signedUrl.url + signedUrl.fields.Key, { agent: httpAgent })
      } catch (err) {
        console.log(err)
      }
      if (!res) console.log('Make sure server is running')
      assert.ok(res?.ok)
    })

    // Unable to perform move/copy and rename test cases because Fleek storage doesn't implemented those methods

    it(`should be able to move/copy object in ${provider.constructor.name}`, async function () {
      const fileKeyOriginal = path.join(testFolderName, testFileName)
      const fileKeyTemp = path.join(testFolderName, 'temp', testFileName)
      const fileKeyTemp2 = path.join(testFolderName, 'temp2', testFileName)

      //check copy functionality
      await provider.moveObject(fileKeyOriginal, folderKeyTemp, true)
      await assert.rejects(provider.checkObjectExistence(fileKeyOriginal))
      await assert.rejects(provider.checkObjectExistence(fileKeyTemp))

      //check move functionality
      await provider.moveObject(fileKeyTemp, folderKeyTemp2)
      await assert.rejects(provider.checkObjectExistence(fileKeyTemp2))
      await assert.doesNotReject(provider.checkObjectExistence(fileKeyTemp))
    })

    it(`should be able to rename object in ${provider.constructor.name}`, async function () {
      const temp2Folder = path.join(testFolderName, 'temp2')
      const fileKeyTemp2 = path.join(temp2Folder, testFileName)
      await provider.moveObject(fileKeyTemp2, temp2Folder, false, 'Renamed.txt')
      const res = await provider.listFolderContent(temp2Folder, true)
      if (res[0].name === 'Renamed' && res.length === 1) {
        assert.ok(true)
        return
      }
      assert.ok(false)
    })

    it(`should delete object in ${provider.constructor.name}`, async function () {
      const fileKey = path.join(testFolderName, testFileName)
      assert.ok(await provider.deleteResources([fileKey]))
    })

    it(`should put and get same data for glbs in ${provider.constructor.name}`, async function () {
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

    it(`should put over 1000 objects in ${provider.constructor.name}`, async function () {
      const promises: any[] = []
      for (let i = 0; i < 1010; i++) {
        const fileKey = path.join(testFolderName, `${i}-${testFileName}`)
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
    })

    it(`should list over 1000 objects in ${provider.constructor.name}`, async function () {
      const res = await provider.listFolderContent(testFolderName, true)
      assert(res.length > 1000)
    })

    after(async function () {
      await providerAfterTest(provider, testFolderName)
    })
  })
})
