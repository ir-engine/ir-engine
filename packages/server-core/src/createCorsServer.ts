import cors_proxy from 'cors-anywhere'
import net from 'net'

import config from './appconfig'

const createCorsServer = (useSSL, certOptions, port) => {
  cors_proxy
    .createServer({
      httpsOptions: useSSL
        ? {
            key: certOptions.key,
            cert: certOptions.cert
          }
        : null,
      originWhitelist: [], // Allow all origins
      requireHeader: [
        /*'origin', 'x-requested-with'*/
      ],
      removeHeaders: ['cookie', 'cookie2']
    })
    .listen(port, function () {
      console.info('Running CORS on port:' + port)
    })
}

export const StartCorsServer = (useSSL, certOptions) => {
  const port = config.server.corsServerPort
  isPortTaken(port, () => {
    createCorsServer(useSSL, certOptions, port)
  })
}

const isPortTaken = (port, fn) => {
  const tester = net
    .createServer()
    .once('error', (err) => {
      console.error(err)
    })
    .once('listening', () => {
      tester
        .once('close', () => {
          fn()
        })
        .close()
    })
    .listen(port)
}
