/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/
import { FileBrowserContentType } from '@ir-engine/common/src/schema.type.module'
import { destroyEngine } from '@ir-engine/ecs/src/Engine'
import assert from 'assert'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { FileThumbnailJobState } from './FileThumbnailJobState'

describe('FileThumbnailJobState', () => {
  const filesQueryData: FileBrowserContentType[] = [
    {
      key: 'projects/ir-engine/default-project/public/test.glb',
      name: 'test',
      size: 1000,
      type: 'glb',
      url: 'https://domain/projects/ir-engine/default-project/public/test.glb?hash=test'
    }
  ]

  let app: any
  let fakeService: any
  beforeEach(async () => {
    fakeService = {
      create: sinon.stub(),
      find: sinon.stub()
    }
    app = {
      service: sinon.stub().returns(fakeService)
    }
  })

  afterEach(async () => {
    sinon.restore()
    destroyEngine()
  })

  describe('useGenerateThumbnails', () => {
    it('should add thumbnail jobs for files without thumbnails', async () => {
      const testKey = 'projects/ir-engine/default-project/assets/testThumbnail.glb'

      fakeService.create.resolves({
        key: testKey,
        project: 'default-project',
        thumbnailKey: null,
        thumbnailURL: null
      })

      FileThumbnailJobState.useGenerateThumbnails(filesQueryData)
      const resource = await app.service('fake-service').find({
        query: { key: testKey }
      })
      assert.ok(resource.data.thumbnailKey !== null, 'generated thumbnail key')
    })
  })

  describe('useGenerateDimensions', () => {
    it('should add dimension jobs for file without dimensions', async () => {
      const testKey = 'projects/ir-engine/default-project/assets/testDimension.glb'

      fakeService.create.resolves({
        key: testKey,
        project: 'default-project',
        width: null,
        depth: null,
        height: null
      })
      FileThumbnailJobState.useGenerateDimensions(filesQueryData)
      const resource = await app.service('fake-service').find({
        query: { key: testKey }
      })
      assert.ok(
        resource.data.width !== null && resource.data.height !== null && resource.data.depth !== null,
        'generated dimensions'
      )
    })
  })
})
