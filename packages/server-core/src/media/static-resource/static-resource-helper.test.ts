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
import assert from 'assert'
import fs from 'fs'
import path from 'path'

import { destroyEngine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { Application } from '../../../declarations'
import { mockFetch, restoreFetch } from '../../../tests/util/mockFetch'
import { createFeathersKoaApp } from '../../createApp'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { addAssetsFromProject, downloadResourceAndMetadata } from './static-resource-helper'

describe('static-resource-helper', () => {
  beforeEach(() => {
    const url = 'http://test.com/test'
    mockFetch({
      [url]: {
        contentType: 'application/octet-stream',
        response: Buffer.from('test')
      }
    })
  })

  afterEach(() => {
    restoreFetch()
  })

  describe('downloadResourceAndMetadata', () => {
    it('should return the url if the url is http and forceDownload is false', async () => {
      // todo - serve this file from a local server
      const url = 'http://test.com/test'
      const name = 'test'
      const res = await downloadResourceAndMetadata(url, false)
      assert.deepEqual(res, {
        buffer: url,
        originalname: name,
        mimetype: 'application/octet-stream',
        size: 4
      })
    })

    it('should return the url if the url is http and forceDownload is true', async () => {
      const url = 'http://test.com/test'
      const name = 'test'
      const res = await downloadResourceAndMetadata(url, true)
      assert.deepEqual(res, {
        buffer: Buffer.from('test'),
        originalname: name,
        mimetype: 'application/octet-stream',
        size: 4
      })
    })

    it('should return the url if the url is a file path', async () => {
      const url = path.join(appRootPath.path, 'packages/projects/default-project/default.scene.json')
      const name = 'default.scene.json'
      const res = await downloadResourceAndMetadata(url)
      assert(res.buffer)
      assert.equal(res.originalname, name)
      assert.equal(res.mimetype, 'application/json')
      assert(res.size)
    })
  })
})

const testProject = 'test-project'

describe('audio-upload', () => {
  let app: Application
  beforeEach(async () => {
    app = createFeathersKoaApp()
    await app.setup()
    const storageProvider = getStorageProvider()
    if (await storageProvider.doesExist('test.mp3', 'static-resources/test-project/'))
      await storageProvider.deleteResources(['static-resources/test-project/test.mp3'])
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('addAssetFromProject', () => {
    beforeEach(async () => {
      const url = 'https://test.com/projects/default-project/assets/test.mp3'
      const url2 = getCachedURL('/projects/default-project/assets/test.mp3', getStorageProvider().cacheDomain)
      mockFetch({
        [url]: {
          contentType: 'audio/mpeg',
          response: fs.readFileSync(
            path.join(appRootPath.path, '/packages/projects/default-project/assets/SampleAudio.mp3')
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

    afterEach(() => {
      restoreFetch()
    })

    it('should link audio asset as a new static resource from external url', async () => {
      const storageProvider = getStorageProvider()
      const url = 'https://test.com/projects/default-project/assets/test.mp3'

      const [staticResource] = await addAssetsFromProject(app, [url], testProject, true)

      assert(staticResource.id)
      assert.equal(staticResource.url, getCachedURL(staticResource.key, storageProvider.cacheDomain))
      assert.equal(staticResource.key, 'static-resources/test-project/test.mp3')
      assert.equal(staticResource.mimeType, 'audio/mpeg')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'audio/mpeg')
    })

    it('should link audio asset as a new static resource from another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/test.mp3', storageProvider.cacheDomain)

      const [staticResource] = await addAssetsFromProject(app, [url], testProject, true)

      assert.equal(staticResource.key, 'static-resources/test-project/test.mp3')
      assert.equal(staticResource.mimeType, 'audio/mpeg')
      assert.equal(staticResource.project, testProject)

      const file = await storageProvider.getObject(staticResource.key)
      assert.equal(file.ContentType, 'audio/mpeg')
    })

    it('should link audio asset as a new static resource from url if from the same project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/test.mp3', storageProvider.cacheDomain)

      const [staticResource] = await addAssetsFromProject(app, [url], 'default-project', false)

      assert.equal(staticResource.key, 'projects/default-project/assets/test.mp3')
      assert.equal(staticResource.mimeType, 'audio/mpeg')
      assert.equal(staticResource.project, 'default-project')

      // should not exist under static resources
      const fileExists = await storageProvider.doesExist('test.mp3', 'static-resources/test-project/')
      assert(!fileExists)
    })

    it('should return existing audio asset with the same hash and project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/test.mp3', storageProvider.cacheDomain)

      const [response] = await addAssetsFromProject(app, [url], 'default-project', false)
      const [response2] = await addAssetsFromProject(app, [url], 'default-project', false)

      assert.equal(response.id, response2.id)
    })

    it('should return new audio asset with the same hash exists in another project', async () => {
      const storageProvider = getStorageProvider()
      const url = getCachedURL('/projects/default-project/assets/test.mp3', storageProvider.cacheDomain)

      const [response] = await addAssetsFromProject(app, [url], 'default-project', false)
      const [response2] = await addAssetsFromProject(app, [url], 'test-project', false)

      assert.notEqual(response.id, response2.id)
    })
  })
})
