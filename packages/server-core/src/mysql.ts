/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import knex from 'knex'

import { isDev } from '@etherealengine/common/src/config'
import appConfig from '@etherealengine/server-core/src/appconfig'
import { Application } from '../declarations'
import multiLogger from './ServerLogger'
import { seeder } from './seeder'

const logger = multiLogger.child({ component: 'server-core:mysql' })

export default (app: Application): void => {
  try {
    const { forceRefresh } = appConfig.db

    logger.info('Starting app.')
    const oldSetup = app.setup

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

    const oldTeardown = app.teardown

    let promiseResolve, promiseReject
    app.isSetup = new Promise((resolve, reject) => {
      promiseResolve = resolve
      promiseReject = reject
    })

    app.teardown = async function (...args) {
      try {
        await db.destroy()
        console.log('Knex connection closed')
      } catch (err) {
        logger.error('Knex teardown error')
        logger.error(err)
        promiseReject()
        throw err
      }
      return oldTeardown.apply(this, args)
    }

    app.setup = async function (...args) {
      try {
        const tableCount = await db.raw(
          `select table_schema as etherealengine,count(*) as tables from information_schema.tables where table_type = \'BASE TABLE\' and table_schema not in (\'information_schema\', \'sys\', \'performance_schema\', \'mysql\') group by table_schema order by table_schema;`
        )
        const prepareDb = process.env.PREPARE_DATABASE === 'true' || (isDev && tableCount[0] && !tableCount[0][0])

        try {
          // configure seeder and seed
          await seeder(app, forceRefresh || appConfig.testEnabled, prepareDb)
        } catch (err) {
          logger.error('Feathers seeding error')
          logger.error(err)
          promiseReject()
          throw err
        }

        promiseResolve()
        if ((prepareDb || forceRefresh) && (isDev || process.env.EXIT_ON_DB_INIT === 'true')) process.exit(0)
      } catch (err) {
        logger.error('Knex setup error')
        logger.error(err)
        promiseReject()
        throw err
      }

      return oldSetup.apply(this, args)
    }

    app.set('knexClient', db)
  } catch (err) {
    logger.error('Error in server-core mysql.ts')
    logger.error(err)
  }
}
