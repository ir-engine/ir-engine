import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import path from 'path'

import { AdminAssetUploadArgumentsType, UploadFile } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { mockFetch, restoreFetch } from '../../../tests/util/mockFetch'
import { createFeathersKoaApp } from '../../createApp'
import { downloadResourceAndMetadata } from '../static-resource/static-resource-helper'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'
import {
  addAssetAsStaticResource,
  createStaticResourceHash,
  getFileMetadata,
  uploadAsset
} from './upload-asset.service'

const testProject = 'test-project'

describe('upload-asset', () => {
  let app: Application

  beforeEach(async () => {
    const storageProvider = getStorageProvider()
    const url = getCachedURL('/projects/default-project/default.scene.json', storageProvider.cacheDomain)
    const url2 = getCachedURL('/projects/default-project/assets/SampleAudio.mp3', storageProvider.cacheDomain)
    mockFetch({
      [url]: {
        contentType: 'application/json',
        response: fs.readFileSync(path.join(appRootPath.path, '/packages/projects/default-project/default.scene.json'))
      },
      [url2]: {
        contentType: 'audio/mpeg',
        response: fs.readFileSync(
          path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleAudio.mp3')
        )
      }
    })
    app = createFeathersKoaApp()
    await app.setup()
  })

  afterEach(() => {
    restoreFetch()
    return destroyEngine()
  })

  describe('addAssetAsStaticResource', () => {
    it('should add asset as a new static resource from buffer', async () => {
      const testJson = {
        test: 'a test'
      }

      const buffer = Buffer.from(JSON.stringify(testJson))
      const files = [
        {
          buffer,
          originalname: 'test.json',
          mimetype: 'application/json',
          size: buffer.byteLength
        }
      ] as UploadFile[]
      const hash = createStaticResourceHash(buffer, { name: 'test.json' })

      const args = {
        hash,
        path: 'static-resources/test',
        staticResourceType: 'json',
        project: testProject
      } as AdminAssetUploadArgumentsType

      const response = await addAssetAsStaticResource(app, files, args)
      assert.equal(response.key, 'static-resources/test/test.json')
      assert.equal(response.hash, hash)
      assert.equal(response.mimeType, 'application/json')
      assert.equal(response.staticResourceType, 'json')
      assert.equal(response.project, testProject)

      const staticResource = await app.service('static-resource').get(response.id)
      assert.equal(staticResource.key, 'static-resources/test/test.json')
      assert.equal(staticResource.hash, hash)
      assert.equal(staticResource.mimeType, 'application/json')
      assert.equal(staticResource.staticResourceType, 'json')
      assert.equal(staticResource.project, testProject)

      const storageProvider = getStorageProvider()
      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'application/json')

      const json = JSON.parse(file.Body.toString())
      assert.deepEqual(json, testJson)
    })

    it('should add asset as a new static resource from path', async () => {
      // todo - serve this file from a local server
      const assetPath = path.join(appRootPath.path, 'packages/projects/default-project/default.scene.json')
      const name = 'default.scene.json'
      const hash = createStaticResourceHash(assetPath, { name })

      const files = await downloadResourceAndMetadata(assetPath, true)
      const args = {
        hash,
        path: 'static-resources/test',
        staticResourceType: 'json',
        project: testProject
      } as AdminAssetUploadArgumentsType

      const response = await addAssetAsStaticResource(app, [files], args)
      assert.equal(response.key, 'static-resources/test/default.scene.json')
      assert.equal(response.hash, hash)
      assert.equal(response.mimeType, 'application/json')
      assert.equal(response.staticResourceType, 'json')
      assert.equal(response.project, testProject)

      const staticResource = await app.service('static-resource').get(response.id)
      assert.equal(staticResource.key, 'static-resources/test/default.scene.json')
      assert.equal(staticResource.hash, hash)
      assert.equal(staticResource.mimeType, 'application/json')
      assert.equal(staticResource.staticResourceType, 'json')
      assert.equal(staticResource.project, testProject)

      const storageProvider = getStorageProvider()
      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'application/json')
    })

    it('should add asset as a new static resource from url', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/default.scene.json', storageProvider.cacheDomain)
      const name = 'default.scene.json'
      const hash = createStaticResourceHash(url, { name })

      const files = await downloadResourceAndMetadata(url, true)
      const args = {
        hash,
        path: 'static-resources/test',
        staticResourceType: 'json',
        project: testProject
      } as AdminAssetUploadArgumentsType

      const response = await addAssetAsStaticResource(app, [files], args)
      assert.equal(response.key, 'static-resources/test/default.scene.json')
      assert.equal(response.hash, hash)
      assert.equal(response.mimeType, 'application/json')
      assert.equal(response.staticResourceType, 'json')
      assert.equal(response.project, testProject)

      const staticResource = await app.service('static-resource').get(response.id)
      assert.equal(staticResource.key, 'static-resources/test/default.scene.json')
      assert.equal(staticResource.hash, hash)
      assert.equal(staticResource.mimeType, 'application/json')
      assert.equal(staticResource.staticResourceType, 'json')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'application/json')
    })
  })

  describe('uploadAsset', () => {
    describe('audio', () => {
      it('should upload audio asset as a new static resource from url', async () => {
        const storageProvider = getStorageProvider()
        const buffer = fs.readFileSync(
          path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleAudio.mp3')
        )
        const file = {
          buffer,
          originalname: 'SampleAudio.mp3',
          mimetype: 'audio/mpeg',
          size: buffer.byteLength
        } as UploadFile

        const { hash } = await getFileMetadata({
          file: file,
          name: file.originalname
        })

        const response = await uploadAsset(app, {
          project: testProject,
          files: [file]
        })

        assert(response.id)
        assert.equal(response.url, getCachedURL(response.key, storageProvider.cacheDomain))
        assert.equal(response.key, `/temp/${hash}/SampleAudio.mp3`)
        assert.equal(response.mimeType, 'audio/mpeg')
        assert.equal(response.project, testProject)

        const fileExists = await storageProvider.doesExist('SampleAudio.mp3', `temp/${hash}/`)
        assert(fileExists)
      })

      it('should return existing audio asset with the same hash and project', async () => {
        const buffer = fs.readFileSync(
          path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleAudio.mp3')
        )
        const file = {
          buffer,
          originalname: 'SampleAudio.mp3',
          mimetype: 'audio/mpeg',
          size: buffer.byteLength
        } as UploadFile

        const response = await uploadAsset(app, {
          project: testProject,
          files: [file]
        })
        const response2 = await uploadAsset(app, {
          project: testProject,
          files: [file]
        })

        assert.equal(response.id, response2.id)
      })
    })
  })
})
