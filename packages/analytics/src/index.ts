import config from '@xrengine/server-core/src/appconfig'
import app from './app'
import logger from '@xrengine/server-core/src/logger'

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION - Promise: ', promise, ', Error: ', error, ').')
})
;(async (): Promise<void> => {
  console.log('Starting analytics server')
  const port = config.analytics.port || 5050

  await app.listen(port)

  console.log('Started listening on', port)
  process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason))
})()
