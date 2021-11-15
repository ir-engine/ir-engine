import assert, { strictEqual } from 'assert'
import fetch from 'node-fetch'
import path from 'path'
const https = require('https')
import S3Provider from '../../src/media/storageprovider/s3.storage'
import LocalStorage from '../../src/media/storageprovider/local.storage'
import { StorageProviderInterface } from '../../src/media/storageprovider/storageprovider.interface'
import { providerBeforeTest, providerAfterTest } from '../storageprovider/storageproviderconfig'

describe('Storage Provider test', () => {
  const testFileName = 'TestFile.txt'
  const testFolderName = 'TestFolder'
  const testFileContent = 'This is the Test File'
  const folderKeyTemp = path.join(testFolderName, 'temp')
  const folderKeyTemp2 = path.join(testFolderName, 'temp2')

  const storageProviders: StorageProviderInterface[] = []
  storageProviders.push(new LocalStorage())
  //storageProviders.push(new S3Provider())
  
  storageProviders.forEach((provider) => {
    before(async function () {
      await providerBeforeTest(provider)
    })

    it(`should put object in ${provider.constructor.name}`, async function () {
      const fileKey = path.join(testFolderName, testFileName)
      const data = Buffer.from(testFileContent)
      await provider.putObject({
        Body: data,
        Key: fileKey,
        ContentType: 'txt'
      })
    })

    it(`should have object in ${provider.constructor.name}`, async function () {
      const fileKey = path.join(testFolderName, testFileName)
      await assert.rejects(provider.checkObjectExistence(fileKey))
    })

    it(`should get object in ${provider.constructor.name}`, async function () {
      const fileKey = path.join(testFolderName, testFileName)
      const body = (await provider.getObject(fileKey)).Body
      assert.ok(body.toString() === testFileContent)
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
      const url = (await provider.getSignedUrl(fileKey, 20000, [])).url
      const httpAgent = new https.Agent({
        rejectUnauthorized: false
      })
      let res
      try {
        res = await fetch(url)
      } catch (err) {
        console.log(err)
      }
      if (!res) console.log('Make sure server is running')
      assert.ok(res?.ok)
    })

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
      if (res[0].name === 'Renamed' && res.length===1) {
        assert.ok(true)
        return
      }
      assert.ok(false)
    })

    it(`should delete object in ${provider.constructor.name}`, async function () {
      const fileKey = path.join(testFolderName, testFileName)
      assert.ok(await provider.deleteResources([fileKey]))
    })

    after(async function () {
      await providerAfterTest(provider)
    })
  })
})
