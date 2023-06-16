import appRootPath from 'app-root-path'
import assert from 'assert'
import path from 'path'

import { mockFetch, restoreFetch } from '../../../tests/util/mockFetch'
import { downloadResourceAndMetadata } from './static-resource-helper'

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
        size: 6
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
