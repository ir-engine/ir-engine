import { Application } from '@xrengine/server-core/declarations'
import config from '@xrengine/server-core/src/appconfig'
import logger from '@xrengine/server-core/src/logger'

import { createApp } from './app'
import collectAnalytics from './collect-analytics'

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION - Promise: ', promise, ', Error: ', error, ').')
})

export const start = async (): Promise<Application> => {
  const app = createApp()

  collectAnalytics(app)
  console.log('Analytics server running')

  const port = config.analytics.port || 5050

  await app.listen(port)

  console.log('Started listening on', port)
  process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason))

  return app
}
