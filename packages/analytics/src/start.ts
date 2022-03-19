import { pipe } from '@xrengine/common/src/utils/pipe'
import { Application } from '@xrengine/server-core/declarations'
import config from '@xrengine/server-core/src/appconfig'
import {
  configureK8s,
  configureOpenAPI,
  configureRedis,
  configureSocketIO,
  createFeathersExpressApp
} from '@xrengine/server-core/src/createApp'
import logger from '@xrengine/server-core/src/logger'

import collectAnalytics from './collect-analytics'

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION - Promise: ', promise, ', Error: ', error, ').')
})

const analyticsServerPipe = pipe(configureSocketIO())

export const start = async (): Promise<Application> => {
  const app = createFeathersExpressApp(analyticsServerPipe)

  app.set('host', config.server.local ? config.server.hostname + ':' + config.server.port : config.server.hostname)
  app.set('port', config.server.port)

  collectAnalytics(app)
  console.log('Analytics server running')

  const port = config.analytics.port || 5050

  await app.listen(port)

  console.log('Started listening on', port)
  process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason))

  return app
}
