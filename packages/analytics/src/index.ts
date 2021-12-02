import config from '@xrengine/server-core/src/appconfig'
import app from './app'
import logger from '@xrengine/server-core/src/logger'
import { useSettingAnalyticsState } from '@xrengine/client-core/src/admin/services/Setting/SettingAnalyticsService'

const [dbAnalyticsConfig] = useSettingAnalyticsState().analytics.value
const analyticsConfig = dbAnalyticsConfig || config.analytics

process.on('unhandledRejection', (error, promise) => {
  console.error('UNHANDLED REJECTION - Promise: ', promise, ', Error: ', error, ').')
})
;(async (): Promise<void> => {
  console.log('Starting analytics server')
  const port = analyticsConfig.port || 5050

  await app.listen(port)

  console.log('Started listening on', port)
  process.on('unhandledRejection', (reason, p) => logger.error('Unhandled Rejection at: Promise ', p, reason))
})()
