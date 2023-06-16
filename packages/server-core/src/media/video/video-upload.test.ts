import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import path from 'path'

import { UploadFile } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { mockFetch, restoreFetch } from '../../../tests/util/mockFetch'
import { createFeathersKoaApp } from '../../createApp'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { getFileMetadata } from '../upload-asset/upload-asset.service'
import { addVideoAssetFromProject, videoUploadFile } from './video-upload.helper'

const testProject = 'test-project'

describe('video-upload', () => {
  let app: Application
  beforeEach(async () => {
    app = createFeathersKoaApp()
    await app.setup()
    const storageProvider = getStorageProvider()
    if (await storageProvider.doesExist('SampleVideo.mp4', 'static-resources/test-project/'))
      await storageProvider.deleteResources(['static-resources/test-project/SampleVideo.mp4'])
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('addVideoAssetFromProject', () => {
    beforeEach(() => {
      const url = 'https://test.com/projects/default-project/assets/SampleVideo.mp4'
      mockFetch({
        [url]: {
          contentType: 'video/mp4',
          response: fs.readFileSync(
            path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleVideo.mp4')
          )
        }
      })
    })

    afterEach(() => {
      restoreFetch()
    })

    it('should link video asset as a new static resource from external url', async () => {
      const storageProvider = getStorageProvider()
      const url = 'https://test.com/projects/default-project/assets/SampleVideo.mp4'

      const response = await addVideoAssetFromProject(app, [url], testProject, true)

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleVideo.mp4`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/SampleVideo.mp4')
      assert.equal(staticResource.mimeType, 'video/mp4')
      assert.equal(staticResource.staticResourceType, 'video')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'video/mp4')
    })

    it('should link video asset as a new static resource from another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleVideo.mp4', storageProvider.cacheDomain)

      const response = await addVideoAssetFromProject(app, [url], testProject, true)

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleVideo.mp4`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/SampleVideo.mp4')
      assert.equal(staticResource.mimeType, 'video/mp4')
      assert.equal(staticResource.staticResourceType, 'video')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'video/mp4')
    })

    it('should link video asset as a new static resource from url if from the same project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleVideo.mp4', storageProvider.cacheDomain)

      const response = await addVideoAssetFromProject(app, [url], 'default-project', false)

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleVideo.mp4`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'projects/default-project/assets/SampleVideo.mp4')
      assert.equal(staticResource.mimeType, 'video/mp4')
      assert.equal(staticResource.staticResourceType, 'video')
      assert.equal(staticResource.project, 'default-project')

      // should not exist under static resources
      const fileExists = await storageProvider.doesExist('SampleVideo.mp4', 'static-resources/test-project/')
      assert(!fileExists)
    })

    it('should return existing video asset with the same hash and project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleVideo.mp4', storageProvider.cacheDomain)

      const response = await addVideoAssetFromProject(app, [url], 'default-project', false)
      const response2 = await addVideoAssetFromProject(app, [url], 'default-project', false)

      assert.equal(response.staticResourceId, response2.staticResourceId)
    })

    it('should return new video asset with the same hash exists in another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleVideo.mp4', storageProvider.cacheDomain)

      const response = await addVideoAssetFromProject(app, [url], 'default-project', false)
      const response2 = await addVideoAssetFromProject(app, [url], 'test-project', false)

      assert.notEqual(response.staticResourceId, response2.staticResourceId)
    })
  })

  describe('videoUploadFile', () => {
    it('should upload video asset as a new static resource from url', async () => {
      const storageProvider = getStorageProvider()
      const buffer = fs.readFileSync(
        path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleVideo.mp4')
      )
      const file = {
        buffer,
        originalname: 'SampleVideo.mp4',
        mimetype: 'video/mp4',
        size: buffer.byteLength
      } as UploadFile

      const { hash } = await getFileMetadata({
        file: file,
        name: file.originalname
      })

      const response = await videoUploadFile(app, {
        project: testProject,
        files: [file]
      })

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleVideo.mp4`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, `/temp/${hash}/SampleVideo.mp4`)
      assert.equal(staticResource.mimeType, 'video/mp4')
      assert.equal(staticResource.staticResourceType, 'video')
      assert.equal(staticResource.project, testProject)

      const fileExists = await storageProvider.doesExist('SampleVideo.mp4', `temp/${hash}/`)
      assert(fileExists)
    })

    it('should return existing video asset with the same hash and project', async () => {
      const buffer = fs.readFileSync(
        path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleVideo.mp4')
      )
      const file = {
        buffer,
        originalname: 'SampleVideo.mp4',
        mimetype: 'video/mp4',
        size: buffer.byteLength
      } as UploadFile

      const response = await videoUploadFile(app, {
        project: testProject,
        files: [file]
      })
      const response2 = await videoUploadFile(app, {
        project: testProject,
        files: [file]
      })

      assert.equal(response.staticResourceId, response2.staticResourceId)
    })
  })
})
