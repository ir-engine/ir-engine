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
import { addImageAssetFromProject, imageUploadFile } from './image-upload.helper'

const testProject = 'test-project'

describe('image-upload', () => {
  let app: Application
  beforeEach(async () => {
    app = createFeathersKoaApp()
    await app.setup()
    const storageProvider = getStorageProvider()
    if (await storageProvider.doesExist('sky_skybox.jpg', 'static-resources/test-project/'))
      await storageProvider.deleteResources(['static-resources/test-project/sky_skybox.jpg'])
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('addImageAssetFromProject', () => {
    beforeEach(async () => {
      mockFetch(
        'image/jpeg',
        fs.readFileSync(path.join(appRootPath.path, '/packages/projects/default-project/assets/sky_skybox.jpg'))
      )
    })

    afterEach(() => {
      restoreFetch()
    })

    it('should link image asset as a new static resource from external url', async () => {
      const storageProvider = getStorageProvider()
      const url = 'https://test.com/projects/default-project/assets/sky_skybox.jpg'

      const response = await addImageAssetFromProject(app, [url], testProject, true)

      assert(response.staticResourceId)
      assert.equal(response.name, `sky_skybox.jpg`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/sky_skybox.jpg')
      assert.equal(staticResource.mimeType, 'image/jpeg')
      assert.equal(staticResource.staticResourceType, 'image')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'image/jpeg')
    })

    it('should link image asset as a new static resource from another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/sky_skybox.jpg', storageProvider.cacheDomain)

      const response = await addImageAssetFromProject(app, [url], testProject, true)

      assert(response.staticResourceId)
      assert.equal(response.name, `sky_skybox.jpg`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/sky_skybox.jpg')
      assert.equal(staticResource.mimeType, 'image/jpeg')
      assert.equal(staticResource.staticResourceType, 'image')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'image/jpeg')
    })

    it('should link image asset as a new static resource from url if from the same project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/sky_skybox.jpg', storageProvider.cacheDomain)

      const response = await addImageAssetFromProject(app, [url], 'default-project', false)

      assert(response.staticResourceId)
      assert.equal(response.name, `sky_skybox.jpg`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'projects/default-project/assets/sky_skybox.jpg')
      assert.equal(staticResource.mimeType, 'image/jpeg')
      assert.equal(staticResource.staticResourceType, 'image')
      assert.equal(staticResource.project, 'default-project')

      // should not exist under static resources
      const fileExists = await storageProvider.doesExist('sky_skybox.jpg', 'static-resources/test-project/')
      assert(!fileExists)
    })

    it('should return existing image asset with the same hash and project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/sky_skybox.jpg', storageProvider.cacheDomain)

      const response = await addImageAssetFromProject(app, [url], 'default-project', false)
      const response2 = await addImageAssetFromProject(app, [url], 'default-project', false)

      assert.equal(response.staticResourceId, response2.staticResourceId)
    })

    it('should return new image asset with the same hash exists in another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/sky_skybox.jpg', storageProvider.cacheDomain)

      const response = await addImageAssetFromProject(app, [url], 'default-project', false)
      const response2 = await addImageAssetFromProject(app, [url], 'test-project', false)

      assert.notEqual(response.staticResourceId, response2.staticResourceId)
    })
  })

  describe('imageUploadFile', () => {
    it('should upload image asset as a new static resource from url', async () => {
      const storageProvider = getStorageProvider()
      const buffer = fs.readFileSync(
        path.join(appRootPath.path, '/packages/projects/default-project/assets/sky_skybox.jpg')
      )
      const file = {
        buffer,
        originalname: 'sky_skybox.jpg',
        mimetype: 'image/jpeg',
        size: buffer.byteLength
      } as UploadFile

      const { hash } = await getFileMetadata({
        file: file,
        name: file.originalname
      })

      const response = await imageUploadFile(app, {
        project: testProject,
        files: [file]
      })

      assert(response.staticResourceId)
      assert.equal(response.name, `sky_skybox.jpg`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, `/temp/${hash}/sky_skybox.jpg`)
      assert.equal(staticResource.mimeType, 'image/jpeg')
      assert.equal(staticResource.staticResourceType, 'image')
      assert.equal(staticResource.project, testProject)

      const fileExists = await storageProvider.doesExist('sky_skybox.jpg', `temp/${hash}/`)
      assert(fileExists)
    })

    it('should return existing image asset with the same hash and project', async () => {
      const buffer = fs.readFileSync(
        path.join(appRootPath.path, '/packages/projects/default-project/assets/sky_skybox.jpg')
      )
      const file = {
        buffer,
        originalname: 'sky_skybox.jpg',
        mimetype: 'image/jpeg',
        size: buffer.byteLength
      } as UploadFile

      const response = await imageUploadFile(app, {
        project: testProject,
        files: [file]
      })
      const response2 = await imageUploadFile(app, {
        project: testProject,
        files: [file]
      })

      assert.equal(response.staticResourceId, response2.staticResourceId)
    })
  })
})
