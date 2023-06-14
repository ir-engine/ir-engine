import appRootPath from 'app-root-path'
import assert from 'assert'
import path from 'path'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { createFeathersKoaApp } from '../../createApp'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { audioUpload } from './audio-upload.helper'

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

  describe('audioUpload', () => {
    it('should upload audio asset as a new static resource from url forcing download', async () => {
      const url = path.join(appRootPath.path, 'packages/projects/default-project/assets/SampleAudio.mp3')

      const response = await audioUpload(
        app,
        {
          project: testProject,
          url: url
        },
        true
      )

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleAudio.mp3`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/SampleAudio.mp3')
      assert.equal(staticResource.mimeType, 'audio/mpeg')
      assert.equal(staticResource.staticResourceType, 'audio')
      assert.equal(staticResource.project, testProject)

      const storageProvider = getStorageProvider()
      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'audio/mpeg')
    })

    it('should upload audio asset as a new static resource from url', async () => {
      const url = path.join(appRootPath.path, 'packages/projects/default-project/assets/SampleAudio.mp3')

      const response = await audioUpload(
        app,
        {
          project: testProject,
          url: url
        },
        false
      )

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleAudio.mp3`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/SampleAudio.mp3')
      assert.equal(staticResource.mimeType, 'audio/mpeg')
      assert.equal(staticResource.staticResourceType, 'audio')
      assert.equal(staticResource.project, testProject)

      const storageProvider = getStorageProvider()
      const fileExists = await storageProvider.doesExist('SampleAudio.mp3', 'static-resources/test-project/')
      assert(!fileExists)
    })
  })
})
