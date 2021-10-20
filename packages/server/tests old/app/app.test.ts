import { Server } from 'http'
import axios from 'axios'
import app from '../../packages/server/src/app'
import appconfig from '../../packages/server-core/src/appconfig'
import { getUrl } from '../test-utils'
import https from 'https'

const port = appconfig.server.port
const agent = new https.Agent({
  rejectUnauthorized: false
});

describe.skip('Feathers application tests', () => {
  let server: Server

  beforeAll((done) => {
    server = app.listen(port)
    if (process.env.APP_ENV === 'development') {
      const nextReadyEmitter = app.get('nextReadyEmitter')
      nextReadyEmitter.once('next-ready', () => {
        done()
      })
    }
    else {
      server.once('listening', () => done())
    }
  }, 90000)

  afterAll((done) => {
    server.close(error => {
      if (error) console.log(error)
    })
    done()
  })

  it('starts and shows the index page', async () => {
    const { data } = await axios.get(getUrl(), { httpsAgent: agent })

    expect(data.indexOf('<html lang="en">') !== -1)
  }, 30000)

  describe.skip('404', () => {
    it('shows a 404 HTML page', async () => {
      try {
        await axios.get(getUrl('path/to/nowhere'), {
          httpsAgent: agent,
          headers: {
            Accept: 'text/html'
          }
        })
      } catch (error) {
        const { response } = error

        expect(response.status).toBe(404)
        expect(response.data.indexOf('<html>') !== -1)
      }
    }, 30000)

    // TODO: Configure this test properly to get a JSON response
    // it('shows a 404 JSON error without stack trace', async () => {
    //   try {
    //     await axios.get(getUrl('path/to/nowhere'), {
    //       headers: {
    //         Accept: 'application/json'
    //       }
    //     })
    //   } catch (error) {
    //     const { response } = error
    //
    //     expect(response.status).toBe(404)
    //     expect(response.data.code).toBe(404)
    //     expect(response.data.message).toBe('Page not found')
    //     expect(response.data.name).toBe('NotFound')
    //   }
    // })
  })
})
