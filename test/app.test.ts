import assert from 'assert'
import { Server } from 'http'
import axios from 'axios'
import app from '../src/app'
import config from '../src/config'
import { getUrl } from '../src/test-utils'

const port = config.server.port

describe('Feathers application tests', () => {
  let server: Server

  before((done) => {
    server = app.listen(port)
    server.once('listening', () => done())
  })

  after((done) => {
    server.close(error => {
      if (error) console.log(error)
    })
    done()
  })

  it('starts and shows the index page', async () => {
    const { data } = await axios.get(getUrl())

    assert.ok(data.indexOf('<html lang="en">') !== -1)
  })

  describe('404', () => {
    it('shows a 404 HTML page', async () => {
      try {
        await axios.get(getUrl('path/to/nowhere'), {
          headers: {
            Accept: 'text/html'
          }
        })
        assert.fail('should never get here')
      } catch (error) {
        const { response } = error

        assert.equal(response.status, 404)
        assert.ok(response.data.indexOf('<html>') !== -1)
      }
    })

    it('shows a 404 JSON error without stack trace', async () => {
      try {
        await axios.get(getUrl('path/to/nowhere'))
        assert.fail('should never get here')
      } catch (error) {
        const { response } = error

        assert.equal(response.status, 404)
        assert.equal(response.data.code, 404)
        assert.equal(response.data.message, 'Page not found')
        assert.equal(response.data.name, 'NotFound')
      }
    })
  })
})
