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
import { addModelAssetFromProject, modelUploadFile } from './model-upload.helper'

const testProject = 'test-project'

describe('model-upload', () => {
  let app: Application
  beforeEach(async () => {
    app = createFeathersKoaApp()
    await app.setup()
    const storageProvider = getStorageProvider()
    if (await storageProvider.doesExist('Skybase.glb', 'static-resources/test-project/'))
      await storageProvider.deleteResources(['static-resources/test-project/Skybase.glb'])
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('addModelAssetFromProject', () => {
    beforeEach(async () => {
      mockFetch(
        'model/gltf-binary',
        fs.readFileSync(path.join(appRootPath.path, '/packages/projects/default-project/assets/Skybase.glb'))
      )
    })

    afterEach(() => {
      restoreFetch()
    })

    it('should link model asset as a new static resource from external url', async () => {
      const storageProvider = getStorageProvider()
      const url = 'https://test.com/projects/default-project/assets/Skybase.glb'

      const response = await addModelAssetFromProject(app, [url], testProject, true)

      assert(response.staticResourceId)
      assert.equal(response.name, `Skybase.glb`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/Skybase.glb')
      assert.equal(staticResource.mimeType, 'model/gltf-binary')
      assert.equal(staticResource.staticResourceType, 'model3d')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'model/gltf-binary')
    })

    it('should link model asset as a new static resource from another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/Skybase.glb', storageProvider.cacheDomain)

      const response = await addModelAssetFromProject(app, [url], testProject, true)

      assert(response.staticResourceId)
      assert.equal(response.name, `Skybase.glb`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/Skybase.glb')
      assert.equal(staticResource.mimeType, 'model/gltf-binary')
      assert.equal(staticResource.staticResourceType, 'model3d')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'model/gltf-binary')
    })

    it('should link model asset as a new static resource from url if from the same project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/Skybase.glb', storageProvider.cacheDomain)

      const response = await addModelAssetFromProject(app, [url], 'default-project', false)

      assert(response.staticResourceId)
      assert.equal(response.name, `Skybase.glb`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'projects/default-project/assets/Skybase.glb')
      assert.equal(staticResource.mimeType, 'model/gltf-binary')
      assert.equal(staticResource.staticResourceType, 'model3d')
      assert.equal(staticResource.project, 'default-project')

      // should not exist under static resources
      const fileExists = await storageProvider.doesExist('Skybase.glb', 'static-resources/test-project/')
      assert(!fileExists)
    })

    it('should return existing model asset with the same hash and project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/Skybase.glb', storageProvider.cacheDomain)

      const response = await addModelAssetFromProject(app, [url], 'default-project', false)
      const response2 = await addModelAssetFromProject(app, [url], 'default-project', false)

      assert.equal(response.staticResourceId, response2.staticResourceId)
    })

    it('should return new model asset with the same hash exists in another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/Skybase.glb', storageProvider.cacheDomain)

      const response = await addModelAssetFromProject(app, [url], 'default-project', false)
      const response2 = await addModelAssetFromProject(app, [url], 'test-project', false)

      assert.notEqual(response.staticResourceId, response2.staticResourceId)
    })
  })

  describe('modelUploadFile', () => {
    it('should upload model asset as a new static resource from url', async () => {
      const storageProvider = getStorageProvider()
      const buffer = fs.readFileSync(
        path.join(appRootPath.path, '/packages/projects/default-project/assets/Skybase.glb')
      )
      const file = {
        buffer,
        originalname: 'Skybase.glb',
        mimetype: 'model/gltf-binary',
        size: buffer.byteLength
      } as UploadFile

      const { hash } = await getFileMetadata({
        file: file,
        name: file.originalname
      })

      const response = await modelUploadFile(app, {
        project: testProject,
        files: [file]
      })

      assert(response.staticResourceId)
      assert.equal(response.name, `Skybase.glb`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, `/temp/${hash}/Skybase.glb`)
      assert.equal(staticResource.mimeType, 'model/gltf-binary')
      assert.equal(staticResource.staticResourceType, 'model3d')
      assert.equal(staticResource.project, testProject)

      const fileExists = await storageProvider.doesExist('Skybase.glb', `temp/${hash}/`)
      assert(fileExists)
    })

    it('should return existing model asset with the same hash and project', async () => {
      const buffer = fs.readFileSync(
        path.join(appRootPath.path, '/packages/projects/default-project/assets/Skybase.glb')
      )
      const file = {
        buffer,
        originalname: 'Skybase.glb',
        mimetype: 'model/gltf-binary',
        size: buffer.byteLength
      } as UploadFile

      const response = await modelUploadFile(app, {
        project: testProject,
        files: [file]
      })
      const response2 = await modelUploadFile(app, {
        project: testProject,
        files: [file]
      })

      assert.equal(response.staticResourceId, response2.staticResourceId)
    })
  })
})
