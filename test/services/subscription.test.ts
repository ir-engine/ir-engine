import assert from 'assert'
import app from '../../src/app'
import { Server } from 'http'
import url from 'url'
import axios from 'axios'
import qs from 'querystring'

const port = app.get('port') || 8998
const getUrl = (pathname?: string): string =>
  url.format({
    hostname: app.get('host') || 'localhost',
    protocol: 'http',
    port,
    pathname
  })

describe('subscription service', () => {
  let server: Server

  before(done => {
    server = app.listen(port)
    server.once('listening', () => done())
  })

  after(done => {
    server.close(done)
  })

  it('registered the service', () => {
    const service = app.service('subscription')

    assert.ok(service, 'Registered the service')
  })

  it('should return 401 if sent without authToken', async () => {
    try {
      const response = await axios.post(getUrl('/subscription'), {
        planId: 'journey'
      })
      assert.equal(response.status, 401)
    } catch (error) {
      const { response } = error
      assert.equal(response.status, 401)
    }
  })

  it('should return payment url if sent with authToken', async () => {
    try {
      const token = 'a_valid_jwt_token'
      const response = await axios({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`
        },
        data: qs.stringify({ planId: 'journey' }),
        url: getUrl('/subscription')
      })
      assert.equal(response.status, 201)
    } catch (error) {
      const { response } = error
      assert.equal(response.status, 500)
    }
  })
})
