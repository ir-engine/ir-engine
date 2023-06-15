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
import { addAudioAssetFromProject, audioUploadFile } from './audio-upload.helper'

const testProject = 'test-project'

describe('audio-upload', () => {
  let app: Application
  beforeEach(async () => {
    app = createFeathersKoaApp()
    await app.setup()
    const storageProvider = getStorageProvider()
    if (await storageProvider.doesExist('SampleAudio.mp3', 'static-resources/test-project/'))
      await storageProvider.deleteResources(['static-resources/test-project/SampleAudio.mp3'])
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('addAudioAssetFromProject', () => {
    beforeEach(async () => {
      mockFetch(
        'audio/mpeg',
        fs.readFileSync(path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleAudio.mp3'))
      )
    })

    afterEach(() => {
      restoreFetch()
    })

    it('should link audio asset as a new static resource from external url', async () => {
      const storageProvider = getStorageProvider()
      const url = 'https://test.com/projects/default-project/assets/SampleAudio.mp3'

      const response = await addAudioAssetFromProject(app, [url], testProject, true)

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleAudio.mp3`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/SampleAudio.mp3')
      assert.equal(staticResource.mimeType, 'audio/mpeg')
      assert.equal(staticResource.staticResourceType, 'audio')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'audio/mpeg')
    })

    it('should link audio asset as a new static resource from another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleAudio.mp3', storageProvider.cacheDomain)

      const response = await addAudioAssetFromProject(app, [url], testProject, true)

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleAudio.mp3`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/SampleAudio.mp3')
      assert.equal(staticResource.mimeType, 'audio/mpeg')
      assert.equal(staticResource.staticResourceType, 'audio')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'audio/mpeg')
    })

    it('should link audio asset as a new static resource from url if from the same project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleAudio.mp3', storageProvider.cacheDomain)

      const response = await addAudioAssetFromProject(app, [url], 'default-project', false)

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleAudio.mp3`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'projects/default-project/assets/SampleAudio.mp3')
      assert.equal(staticResource.mimeType, 'audio/mpeg')
      assert.equal(staticResource.staticResourceType, 'audio')
      assert.equal(staticResource.project, 'default-project')

      // should not exist under static resources
      const fileExists = await storageProvider.doesExist('SampleAudio.mp3', 'static-resources/test-project/')
      assert(!fileExists)
    })

    it('should return existing audio asset with the same hash and project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleAudio.mp3', storageProvider.cacheDomain)

      const response = await addAudioAssetFromProject(app, [url], 'default-project', false)
      const response2 = await addAudioAssetFromProject(app, [url], 'default-project', false)

      assert.equal(response.staticResourceId, response2.staticResourceId)
    })

    it('should return new audio asset with the same hash exists in another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleAudio.mp3', storageProvider.cacheDomain)

      const response = await addAudioAssetFromProject(app, [url], 'default-project', false)
      const response2 = await addAudioAssetFromProject(app, [url], 'test-project', false)

      assert.notEqual(response.staticResourceId, response2.staticResourceId)
    })
  })

  describe('audioUploadFile', () => {
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

      const response = await audioUploadFile(app, {
        project: testProject,
        files: [file]
      })

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleAudio.mp3`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, `/temp/${hash}/SampleAudio.mp3`)
      assert.equal(staticResource.mimeType, 'audio/mpeg')
      assert.equal(staticResource.staticResourceType, 'audio')
      assert.equal(staticResource.project, testProject)

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

      const response = await audioUploadFile(app, {
        project: testProject,
        files: [file]
      })
      const response2 = await audioUploadFile(app, {
        project: testProject,
        files: [file]
      })

      assert.equal(response.staticResourceId, response2.staticResourceId)
    })
  })
})
