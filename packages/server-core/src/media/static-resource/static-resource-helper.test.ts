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
import path from 'path'

import { mockFetch, restoreFetch } from '../../../tests/util/mockFetch'
import { downloadResourceAndMetadata } from './static-resource-helper'

describe('static-resource-helper', () => {
  before(() => {
    const url = 'http://test.com/test'
    mockFetch({
      [url]: {
        contentType: 'application/octet-stream',
        response: Buffer.from('test')
      }
    })
  })

  after(() => {
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
