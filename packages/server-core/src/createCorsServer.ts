import cors_proxy from 'cors-anywhere'
import net from 'net'

import config from './appconfig'
import logger from './ServerLogger'

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
      logger.info(`Running CORS on port "${port}".`)
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
      logger.error(err)
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
