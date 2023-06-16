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
import { addVolumetricAssetFromProject, volumetricUploadFile } from './volumetric-upload.helper'

const testProject = 'test-project'

describe('volumetric-upload', () => {
  let app: Application
  beforeEach(async () => {
    app = createFeathersKoaApp()
    await app.setup()
    const storageProvider = getStorageProvider()
    if (await storageProvider.doesExist('SampleVolumetric.mp4', 'static-resources/test-project/'))
      await storageProvider.deleteResources(['static-resources/test-project/SampleVolumetric.mp4'])
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('addVolumetricAssetFromProject', () => {
    beforeEach(async () => {
      const url = 'https://test.com/projects/default-project/assets/SampleVolumetric.mp4'
      mockFetch({
        [url]: {
          contentType: 'volumetric/mp4',
          response: fs.readFileSync(
            path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleVolumetric.mp4')
          )
        }
      })
    })

    afterEach(() => {
      restoreFetch()
    })

    it('should link volumetric asset as a new static resource from external url', async () => {
      const storageProvider = getStorageProvider()
      const url = 'https://test.com/projects/default-project/assets/SampleVolumetric.mp4'

      const response = await addVolumetricAssetFromProject(app, [url], testProject, true)

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleVolumetric.mp4`)

      const mp4StaticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(mp4StaticResource.key, 'static-resources/test-project/SampleVolumetric.mp4')
      assert.equal(mp4StaticResource.mimeType, 'volumetric/mp4')
      assert.equal(mp4StaticResource.staticResourceType, 'volumetric')
      assert.equal(mp4StaticResource.project, testProject)

      const drcsStaticResource = await app.service('static-resource').find({
        query: {
          parentStaticResourceId: mp4StaticResource.id,
          staticResourceType: 'drcs'
        }
      })

      const file = await storageProvider.getObject(mp4StaticResource.key)
      assert.equal(file.ContentType, 'volumetric/mp4')
    })

    it('should link volumetric asset as a new static resource from another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleVolumetric.mp4', storageProvider.cacheDomain)

      const response = await addVolumetricAssetFromProject(app, [url], testProject, true)

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleVolumetric.mp4`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'static-resources/test-project/SampleVolumetric.mp4')
      assert.equal(staticResource.mimeType, 'volumetric/mp4')
      assert.equal(staticResource.staticResourceType, 'volumetric')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'volumetric/mp4')
    })

    it('should link volumetric asset as a new static resource from url if from the same project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleVolumetric.mp4', storageProvider.cacheDomain)

      const response = await addVolumetricAssetFromProject(app, [url], 'default-project', false)

      assert(response.staticResourceId)
      assert.equal(response.name, `SampleVolumetric.mp4`)

      const staticResource = await app.service('static-resource').get(response.staticResourceId)
      assert.equal(staticResource.key, 'projects/default-project/assets/SampleVolumetric.mp4')
      assert.equal(staticResource.mimeType, 'volumetric/mp4')
      assert.equal(staticResource.staticResourceType, 'volumetric')
      assert.equal(staticResource.project, 'default-project')

      // should not exist under static resources
      const fileExists = await storageProvider.doesExist('SampleVolumetric.mp4', 'static-resources/test-project/')
      assert(!fileExists)
    })

    it('should return existing volumetric asset with the same hash and project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleVolumetric.mp4', storageProvider.cacheDomain)

      const response = await addVolumetricAssetFromProject(app, [url], 'default-project', false)
      const response2 = await addVolumetricAssetFromProject(app, [url], 'default-project', false)

      assert.equal(response.staticResourceId, response2.staticResourceId)
    })

    it('should return new volumetric asset with the same hash exists in another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/SampleVolumetric.mp4', storageProvider.cacheDomain)

      const response = await addVolumetricAssetFromProject(app, [url], 'default-project', false)
      const response2 = await addVolumetricAssetFromProject(app, [url], 'test-project', false)

      assert.notEqual(response.staticResourceId, response2.staticResourceId)
    })
  })

  // describe('volumetricUploadFile', () => {
  //   it('should upload volumetric asset as a new static resource from url', async () => {
  //     const storageProvider = getStorageProvider()
  //     const buffer = fs.readFileSync(
  //       path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleVolumetric.mp4')
  //     )
  //     const file = {
  //       buffer,
  //       originalname: 'SampleVolumetric.mp4',
  //       mimetype: 'volumetric/mp4',
  //       size: buffer.byteLength
  //     } as UploadFile

  //     const { hash } = await getFileMetadata({
  //       file: file,
  //       name: file.originalname
  //     })

  //     const response = await volumetricUploadFile(app, {
  //       project: testProject,
  //       files: [file]
  //     })

  //     assert(response.staticResourceId)
  //     assert.equal(response.name, `SampleVolumetric.mp4`)

  //     const staticResource = await app.service('static-resource').get(response.staticResourceId)
  //     assert.equal(staticResource.key, `/temp/${hash}/SampleVolumetric.mp4`)
  //     assert.equal(staticResource.mimeType, 'volumetric/mp4')
  //     assert.equal(staticResource.staticResourceType, 'volumetric')
  //     assert.equal(staticResource.project, testProject)

  //     const fileExists = await storageProvider.doesExist('SampleVolumetric.mp4', `temp/${hash}/`)
  //     assert(fileExists)
  //   })

  //   it('should return existing volumetric asset with the same hash and project', async () => {
  //     const buffer = fs.readFileSync(
  //       path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleVolumetric.mp4')
  //     )
  //     const file = {
  //       buffer,
  //       originalname: 'SampleVolumetric.mp4',
  //       mimetype: 'volumetric/mp4',
  //       size: buffer.byteLength
  //     } as UploadFile

  //     const response = await volumetricUploadFile(app, {
  //       project: testProject,
  //       files: [file]
  //     })
  //     const response2 = await volumetricUploadFile(app, {
  //       project: testProject,
  //       files: [file]
  //     })

  //     assert.equal(response.staticResourceId, response2.staticResourceId)
  //   })
  // })
})
