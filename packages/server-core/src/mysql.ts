import knex from 'knex'

import appConfig from '@etherealengine/server-core/src/appconfig'

import { Application } from '../declarations'
import multiLogger from './ServerLogger'

const logger = multiLogger.child({ component: 'server-core:mysql' })

export default (app: Application): void => {
  try {
    const { forceRefresh } = appConfig.db

    logger.info('Starting app.')

    const db = knex({
      log: forceRefresh
        ? {
            debug: logger.info.bind(logger),
            warn: logger.warn.bind(logger),
            error: logger.error.bind(logger),
            enableColors: true
          }
        : undefined,
      client: 'mysql',
      connection: {
        user: appConfig.db.username,
        password: appConfig.db.password,
        host: appConfig.db.host,
        port: parseInt(appConfig.db.port),
        database: appConfig.db.database,
        charset: 'utf8mb4'
      }
    })

    app.set('knexClient', db)
  } catch (err) {
    logger.error('Error in server-core mysql.ts')
    logger.error(err)
  }
}
