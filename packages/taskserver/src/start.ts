import { pipe } from '@xrengine/common/src/utils/pipe'
import { Application, ServerMode } from '@xrengine/server-core/declarations'
import config from '@xrengine/server-core/src/appconfig'
import { configureRedis, configureSocketIO, createFeathersExpressApp } from '@xrengine/server-core/src/createApp'
import multiLogger from '@xrengine/server-core/src/ServerLogger'

import collectAnalytics from './collect-analytics'

const logger = multiLogger.child({ component: 'taskserver' })

process.on('unhandledRejection', (error, promise) => {
  logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
})

const taskServerPipe = pipe(configureSocketIO(), configureRedis())

export const start = async (): Promise<Application> => {
  const app = createFeathersExpressApp(ServerMode.Task, taskServerPipe)

  app.set('host', config.server.local ? config.server.hostname + ':' + config.server.port : config.server.hostname)
  app.set('port', config.server.port)

  collectAnalytics(app)
  logger.info('Task server running.')

  const port = config.taskserver.port || 5050

  await app.listen(port)

  logger.info('Started listening on ' + port)

  process.on('unhandledRejection', (error, promise) => {
    logger.error(error, 'UNHANDLED REJECTION - Promise: %o', promise)
  })

  return app
}
