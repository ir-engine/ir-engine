import cors_proxy from 'cors-anywhere'
import config from './appconfig'
import net from 'net'

const createCorsServer = (useSSL, certOptions, port) => {
  const host = config.server.hostname
  cors_proxy
    .createServer({
      httpsOptions: useSSL
        ? {
            key: certOptions.key,
            cert: certOptions.cert
          }
        : null,
      originWhitelist: [], // Allow all origins
      requireHeader: ['origin', 'x-requested-with'],
      removeHeaders: ['cookie', 'cookie2']
    })
    .listen(port, host, function () {
      console.info('Running CORS on ' + host + ':' + port)
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
      if (err.name === 'EADDRINUSE') return fn()
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
