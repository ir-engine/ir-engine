/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { destroyEngine } from '@etherealengine/ecs/src/Engine'

import { Application } from '../../../declarations'
import { mockFetch, restoreFetch } from '../../../tests/util/mockFetch'
import { createFeathersKoaApp } from '../../createApp'
import { getStorageProvider } from '../storageprovider/storageprovider'

const testProject = 'test-project'

describe('upload-asset', () => {
  let app: Application

  before(async () => {
    app = createFeathersKoaApp()
    await app.setup()
    const storageProvider = getStorageProvider()
    const url = storageProvider.getCachedURL('/projects/default-project/public/scenes/default.gltf')
    const url2 = storageProvider.getCachedURL('/projects/default-project/assets/SampleAudio.mp3')
    mockFetch({
      [url]: {
        contentType: 'application/json',
        response: fs.readFileSync(
          path.join(appRootPath.path, '/packages/projects/default-project/public/scenes/default.gltf')
        )
      },
      [url2]: {
        contentType: 'audio/mpeg',
        response: fs.readFileSync(
          path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleAudio.mp3')
        )
      }
    })
  })

  after(() => {
    restoreFetch()
    return destroyEngine()
  })

  // describe('addAssetAsStaticResource', () => {
  //   it('should add asset as a new static resource from buffer', async () => {
  //     const testJson = {
  //       test: 'a test'
  //     }

  //     const buffer = Buffer.from(JSON.stringify(testJson))
  //     const file = {
  //       buffer,
  //       originalname: 'test.json',
  //       mimetype: 'application/json',
  //       size: buffer.byteLength
  //     } as UploadFile
  //     const hash = createStaticResourceHash(buffer)

  //     const args = {
  //       hash,
  //       path: 'static-resources/test',
  //       project: testProject
  //     } as AdminAssetUploadArgumentsType

  //     const response = await addAssetAsStaticResource(app, file, args)
  //     assert.equal(response.key, 'static-resources/test/test.json')
  //     assert.equal(response.hash, hash)
  //     assert.equal(response.mimeType, 'application/json')
  //     assert.equal(response.project, testProject)

  //     const staticResource = await app.service(staticResourcePath).get(response.id)
  //     assert.equal(staticResource.key, 'static-resources/test/test.json')
  //     assert.equal(staticResource.hash, hash)
  //     assert.equal(staticResource.mimeType, 'application/json')
  //     assert.equal(staticResource.project, testProject)

  //     const storageProvider = getStorageProvider()
  //     const fileResponse = await storageProvider.getObject(staticResource.key)
  //     assert.equal(fileResponse.ContentType, 'application/json')

  //     const json = JSON.parse(fileResponse.Body.toString())
  //     assert.deepEqual(json, testJson)
  //   })

  //   it('should add asset as a new static resource from path', async () => {
  //     // todo - serve this file from a local server
  //     const assetPath = path.join(appRootPath.path, 'packages/projects/default-project/public/scenes/default.gltf')
  //     const name = 'default.gltf'
  //     const hash = createStaticResourceHash(assetPath)

  //     const file = await downloadResourceAndMetadata(assetPath, true)
  //     const args = {
  //       hash,
  //       path: 'static-resources/test',
  //       project: testProject
  //     } as AdminAssetUploadArgumentsType

  //     const response = await addAssetAsStaticResource(app, file, args)
  //     assert.equal(response.key, 'static-resources/test/default.gltf')
  //     assert.equal(response.hash, hash)
  //     assert.equal(response.mimeType, 'model/gltf')
  //     assert.equal(response.project, testProject)

  //     const staticResource = await app.service(staticResourcePath).get(response.id)
  //     assert.equal(staticResource.key, 'static-resources/test/default.gltf')
  //     assert.equal(staticResource.hash, hash)
  //     assert.equal(staticResource.mimeType, 'model/gltf')
  //     assert.equal(staticResource.project, testProject)

  //     const storageProvider = getStorageProvider()
  //     const fileResponse = await storageProvider.getObject(staticResource.key)
  //     assert.equal(fileResponse.ContentType, 'model/gltf+json')
  //   })

  //   it('should add asset as a new static resource from url', async () => {
  //     const storageProvider = getStorageProvider()
  //     const url = storageProvider.getCachedURL('/projects/default-project/public/scenes/default.gltf')
  //     const name = 'default.gltf'
  //     const hash = createStaticResourceHash(url)

  //     const file = await downloadResourceAndMetadata(url, true)
  //     const args = {
  //       hash,
  //       path: 'static-resources/test',
  //       project: testProject
  //     } as AdminAssetUploadArgumentsType

  //     const response = await addAssetAsStaticResource(app, file, args)
  //     assert.equal(response.key, 'static-resources/test/default.gltf')
  //     assert.equal(response.hash, hash)
  //     assert.equal(response.mimeType, 'application/json')
  //     assert.equal(response.project, testProject)

  //     const staticResource = await app.service(staticResourcePath).get(response.id)
  //     assert.equal(staticResource.key, 'static-resources/test/default.gltf')
  //     assert.equal(staticResource.hash, hash)
  //     assert.equal(staticResource.mimeType, 'application/json')
  //     assert.equal(staticResource.project, testProject)

  //     const fileResponse = await storageProvider.getObject(staticResource.key)
  //     assert.equal(fileResponse.ContentType, 'model/gltf+json')
  //   })
  // })

  // describe('uploadAsset', () => {
  //   describe('audio', () => {
  //     it('should upload audio asset as a new static resource from url', async () => {
  //       const storageProvider = getStorageProvider()
  //       const buffer = fs.readFileSync(
  //         path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleAudio.mp3')
  //       )
  //       const file = {
  //         buffer,
  //         originalname: 'SampleAudio.mp3',
  //         mimetype: 'audio/mpeg',
  //         size: buffer.byteLength
  //       } as UploadFile

  //       const { hash } = await getFileMetadata({
  //         file: file,
  //         name: file.originalname
  //       })

  //       const response = await uploadAsset(app, {
  //         project: testProject,
  //         file
  //       })

  //       assert(response.id)
  //       assert.equal(response.url, storageProvider.getCachedURL(response.key))
  //       assert.equal(response.key, `/temp/${hash}/SampleAudio.mp3`)
  //       assert.equal(response.mimeType, 'audio/mpeg')
  //       assert.equal(response.project, testProject)

  //       const fileExists = await storageProvider.doesExist('SampleAudio.mp3', `temp/${hash}/`)
  //       assert(fileExists)
  //     })

  //     it('should return existing audio asset with the same hash and project', async () => {
  //       const buffer = fs.readFileSync(
  //         path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleAudio.mp3')
  //       )
  //       const file = {
  //         buffer,
  //         originalname: 'SampleAudio.mp3',
  //         mimetype: 'audio/mpeg',
  //         size: buffer.byteLength
  //       } as UploadFile

  //       const response = await uploadAsset(app, {
  //         project: testProject,
  //         file
  //       })
  //       const response2 = await uploadAsset(app, {
  //         project: testProject,
  //         file
  //       })

  //       assert.equal(response.id, response2.id)
  //     })
  //   })
  // })
})
