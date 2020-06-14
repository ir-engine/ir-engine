import { Server } from 'http'
import axios from 'axios'
import app from '../../server/app'
import config from '../../server/config'
import { getUrl } from '../../server/test-utils'

const port = config.server.port

describe('Feathers application tests', () => {
  let server: Server

  beforeAll((done) => {
    server = app.listen(port)
    server.once('listening', () => done())
  })

  afterAll((done) => {
    server.close(error => {
      if (error) console.log(error)
    })
    done()
  })

  it('starts and shows the index page', async () => {
    const { data } = await axios.get(getUrl())

    expect(data.indexOf('<html lang="en">') !== -1)
  })

  describe('404', () => {
    it('shows a 404 HTML page', async () => {
      try {
        await axios.get(getUrl('path/to/nowhere'), {
          headers: {
            Accept: 'text/html'
          }
        })
      } catch (error) {
        const { response } = error

        expect(response.status).toBe(404)
        expect(response.data.indexOf('<html>') !== -1)
      }
    })

    it('shows a 404 JSON error without stack trace', async () => {
      try {
        await axios.get(getUrl('path/to/nowhere'))
      } catch (error) {
        const { response } = error

        expect(response.status).toBe(404)
        expect(response.data.code).toBe(404)
        expect(response.data.message).toBe('Page not found')
        expect(response.data.name).toBe('NotFound')
      }
    })
  })
})
