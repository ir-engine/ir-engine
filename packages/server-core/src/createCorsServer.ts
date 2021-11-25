import cors_proxy from 'cors-anywhere'
import config from './appconfig'
import fs from 'fs'
import net from 'net'

const createCorsServer = (port: number) => {
  const host = config.server.hostname
  cors_proxy
    .createServer({
      httpsOptions: {
        key: fs.readFileSync('../../certs/key.pem'),
        cert: fs.readFileSync('../../certs/cert.pem')
      },
      originWhitelist: [], // Allow all origins
      requireHeader: ['origin', 'x-requested-with'],
      removeHeaders: ['cookie', 'cookie2']
    })
    .listen(port, host, function () {
      console.info('Running CORS on ' + host + ':' + port)
    })
}

export const StartCorsServer = () => {
  const port = config.server.corsServerPort
  isPortTaken(port, createCorsServer)
}

const isPortTaken = (port, fn) => {
  const tester = net
    .createServer()
    .once('error', (err) => {
      if (err.name === 'EADDRINUSE') return fn(port, true)
    })
    .once('listening', () => {
      tester
        .once('close', () => {
          fn(port, false)
        })
        .close()
    })
    .listen(port)
}
