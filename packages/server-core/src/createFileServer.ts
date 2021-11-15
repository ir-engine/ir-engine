import http from 'http'
import serveStatic from 'serve-static'
import config from './appconfig'

const serve = serveStatic('../server/upload/')

let server: http.Server = null

export const createTestFileServer = () => {
  const port = config.server.localStorageProviderPort
  server = http.createServer((req, res) => {
    serve(req, res, null)
  })
  server.listen(port)
}

export const closeTestFileServer = () => {
  server?.close()
}
