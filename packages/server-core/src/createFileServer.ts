import https from 'https'
import serveStatic from 'serve-static'
import config from './appconfig'
import fs from 'fs'

const serve = serveStatic('../server/upload/')

let server: https.Server = null
const options = {
  key: fs.readFileSync('../../certs/key.pem'),
  cert: fs.readFileSync('../../certs/cert.pem')
}
export const createTestFileServer = () => {
  const port = config.server.localStorageProviderPort
  server = https.createServer(options, (req, res) => {
    serve(req, res, null)
  })
  server.listen(port)
}

export const closeTestFileServer = () => {
  server?.close()
}
