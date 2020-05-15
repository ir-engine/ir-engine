import assert from 'assert'
import app from '../../src/app'
import { Server } from 'http'
import url from 'url'
import axios from 'axios'

const port = app.get('port') || 8998
const getUrl = (pathname?: string): string =>
  url.format({
    hostname: app.get('host') || 'localhost',
    protocol: 'http',
    port,
    pathname
  })

describe("'payment' service", () => {
  let server: Server

  before(done => {
    server = app.listen(port)
    server.once('listening', () => done())
  })

  after(done => {
    server.close(done)
  })

  it('registered the service', () => {
    const service = app.service('payment')

    assert.ok(service, 'Registered the service')
  })

  it('should return the checkout sessionId', async () => {
    try {
      const response = await axios.post(getUrl('/payment'), {
        name: 'Some Product',
        amount: 1500,
        quantity: 1
      })
      assert.equal(response.status, 201)
    } catch (error) {
      const { response } = error
      assert.equal(response.status, 404)
    }
  })
})
