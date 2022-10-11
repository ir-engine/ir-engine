import { pipe } from '@xrengine/common/src/utils/pipe'
import { Application, ServerMode } from '@xrengine/server-core/declarations'
import config from '@xrengine/server-core/src/appconfig'
import {
  configureK8s,
  configureOpenAPI,
  configureRedis,
  configureSocketIO,
  createFeathersExpressApp
} from '@xrengine/server-core/src/createApp'
import multiLogger from '@xrengine/server-core/src/ServerLogger'

import collectAnalytics from './collect-analytics'

const logger = multiLogger.child({ component: 'analytics' })

process.on('unhandledRejection', (error, promise) => {
  logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
})

const analyticsServerPipe = pipe(configureSocketIO(), configureRedis())

export const start = async (): Promise<Application> => {
  const app = createFeathersExpressApp(ServerMode.Analytics, analyticsServerPipe)

  app.set('host', config.server.local ? config.server.hostname + ':' + config.server.port : config.server.hostname)
  app.set('port', config.server.port)

  collectAnalytics(app)
  logger.info('Analytics server running.')

  const port = config.analytics.port || 5050

  await app.listen(port)

  logger.info('Started listening on ' + port)

  process.on('unhandledRejection', (error, promise) => {
    logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
  })

  return app
}
