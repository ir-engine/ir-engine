/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025 
Infinite Reality Engine. All Rights Reserved.
*/

import knex from 'knex'

import appConfig from '@ir-engine/server-core/src/appconfig'

import { Application } from '../declarations'
import multiLogger from './ServerLogger'

const logger = multiLogger.child({ component: 'server-core:postgres' })

export default (app: Application): void => {
  const { forceRefresh } = appConfig.vectordb

  try {
    logger.info('Setting up PostgreSQL vector database connection.')
    const oldSetup = app.setup

    const vectorDb = knex({
      log: forceRefresh
        ? {
            debug: logger.info.bind(logger),
            warn: logger.warn.bind(logger),
            error: logger.error.bind(logger),
            enableColors: true
          }
        : undefined,
      client: 'pg',
      connection: {
        user: appConfig.vectordb.username,
        password: appConfig.vectordb.password,
        host: appConfig.vectordb.host,
        port: parseInt(appConfig.vectordb.port),
        database: appConfig.vectordb.database
      },
      pool: {
        min: 0,
        max: appConfig.vectordb.pool.max
      }
    })

    app.setup = async function (...args) {
      const promise = new Promise<void>((resolve, reject) => {
        const promiseResolve = () => {
          resolve()
        }
        const promiseReject = () => {
          reject()
        }

        // Test the vector database connection
        vectorDb
          .raw(`SELECT 1 FROM pg_catalog.pg_database WHERE lower(datname) = lower('${appConfig.vectordb.database}');`)
          .then(() => {
            logger.info('PostgreSQL vector database connection successful: %s', appConfig.vectordb.database)
            promiseResolve()
          })
          .catch((error) => {
            logger.error('PostgreSQL vector database connection failed: %s', error)
            promiseReject()
          })
      })

      return oldSetup.apply(this, args)
    }

    app.set('vectorDbClient', vectorDb)
    logger.info('PostgreSQL vector database client configured.')
  } catch (err) {
    logger.error('Error in server-core postgres.ts')
    logger.error(err)
  }
}
