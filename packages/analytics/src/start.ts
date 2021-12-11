import config from '@xrengine/server-core/src/appconfig'
import { createApp } from './app'
import logger from '@xrengine/server-core/src/logger'
import { updateAppConfig } from './updateAppConfig'
import { Application } from '@xrengine/server-core/declarations'

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION - Promise: ', promise, ', Error: ', error, ').')
})

export const start = async (): Promise<Application> => {
  await updateAppConfig()

  const app = await createApp()
  const port = config.analytics.port || 5050

  await app.listen(port)

  console.log('Started listening on', port)
  process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason))

  return app
}
