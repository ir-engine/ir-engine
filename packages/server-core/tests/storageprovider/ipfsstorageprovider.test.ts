import assert from 'assert'
import fetch from 'node-fetch'
import path from 'path'
const https = require('https')
import S3IPFSProvider from '../../src/media/storageprovider/s3ipfs.storage'
import S3Provider from '../../src/media/storageprovider/s3.storage'
import LocalStorage from '../../src/media/storageprovider/local.storage'
import { StorageProviderInterface } from '../../src/media/storageprovider/storageprovider.interface'
import { providerBeforeTest, providerAfterTest } from './storageproviderconfig'
import { getContentType } from '../../src/util/fileUtils'
import approot from 'app-root-path'
import fs from 'fs-extra'
import { v4 as uuid } from 'uuid'

describe('ipfsstorageprovider', () => {
  const testFileName = 'TestFile.txt'
  const testFolderName = `TestFolder-${uuid()}`
  const testFileContent = 'content'
  const folderKeyTemp = path.join(testFolderName, 'temp')
  const folderKeyTemp2 = path.join(testFolderName, 'temp2')

  const storageProviders: StorageProviderInterface[] = []
  if(process.env.IPFS_FLEEK_BUCKET && process.env.IPFS_FLEEK_API_KEY && process.env.IPFS_FLEEK_API_SECRET_KEY)
    storageProviders.push(new S3IPFSProvider())

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
        res = await fetch(signedUrl.url + signedUrl.fields.Key,{agent:httpAgent})
      } catch (err) {
        console.log(err)
      }
      if (!res) console.log('Make sure server is running')
      assert.ok(res?.ok)
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

    it(`should put over 10 objects in ${provider.constructor.name}`, async function () {
      const promises: any[] = []
      for(let i = 0; i < 11; i++) {
        const fileKey = path.join(testFolderName, `${i}-${testFileName}`)
        const data = Buffer.from(testFileContent)
        promises.push(provider.putObject({
          Body: data,
          Key: fileKey,
          ContentType: getContentType(fileKey)
        }))
      }
      await Promise.all(promises)
    })

    it(`should list over 10 objects in ${provider.constructor.name}`, async function () {
      const res = await provider.listFolderContent(testFolderName, true)
      assert(res.length > 10)
    })

    after(async function () {
      await providerAfterTest(provider, testFolderName)
    })
  })
})
