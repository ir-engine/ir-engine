import appRootPath from 'app-root-path'
import assert from 'assert'
import path from 'path'

import config from '../../appconfig'
import { getResourceFiles } from './static-resource-helper'

const testProject = 'test project'

const originalFetch = (global as any).fetch

describe('static-resource-helper', () => {
  beforeEach(() => {
    // override fetch
    ;(global as any).fetch = async (url: string, options?: any) => {
      if (options?.method === 'HEAD') {
        return {
          status: 200,
          headers: new Map().set('content-length', '4').set('content-type', 'application/octet-stream')
        }
      } else {
        return {
          arrayBuffer: async () => Buffer.from('test'),
          status: 200,
          headers: new Map().set('content-length', '6').set('content-type', 'application/octet-stream')
        }
      }
    }
  })

  afterEach(() => {
    // restore fetch
    ;(global as any).fetch = originalFetch
  })

  describe('getResourceFiles', () => {
    it('should return the files if they are provided', async () => {
      const files = [
        {
          buffer: Buffer.from('test'),
          originalname: 'test',
          mimetype: 'application/octet-stream',
          size: 4
        }
      ]
      const res = await getResourceFiles({ project: testProject, files })
      assert.deepEqual(res, files)
    })

    it('should return the url if the url is http and forceDownload is false', async () => {
      // todo - serve this file from a local server
      const url = 'http://test.com/test'
      const name = 'test'
      const res = await getResourceFiles({ project: testProject, url, name }, false)
      assert.deepEqual(res, [
        {
          buffer: url,
          originalname: name,
          mimetype: 'application/octet-stream',
          size: 4
        }
      ])
    })

    it('should return the url if the url is http and forceDownload is true', async () => {
      const url = 'http://test.com/test'
      const name = 'test'
      config.server.cloneProjectStaticResources = true
      const res = await getResourceFiles({ project: testProject, url, name }, true)
      assert.deepEqual(res, [
        {
          buffer: Buffer.from('test'),
          originalname: name,
          mimetype: 'application/octet-stream',
          size: 6
        }
      ])
    })

    it('should return the url if the url is a file path', async () => {
      const url = path.join(appRootPath.path, 'packages/projects/default-project/default.scene.json')
      const name = 'default.scene.json'
      const res = await getResourceFiles({ project: testProject, url, name })
      assert(res[0].buffer)
      assert.equal(res[0].originalname, name)
      assert.equal(res[0].mimetype, 'application/json')
      assert(res[0].size)
    })
  })
})
