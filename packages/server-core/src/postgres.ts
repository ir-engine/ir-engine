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

import knex, { Knex } from 'knex'

import appConfig from '@ir-engine/server-core/src/appconfig'

import { Application } from '../declarations'
import multiLogger from './ServerLogger'

import { createDatabase, runVectorDbMigrations } from './media/static-resource-vector/vector-db-migrations'

const logger = multiLogger.child({ component: 'server-core:postgres' })

const checkLock = async (vectorDb: Knex, delayInMs: number) => {
  const trx = await vectorDb.transaction()
  await trx.raw("SET session_replication_role = 'replica'")

  const lockTableExists = await trx.schema.hasTable('knex_migrations_lock')
  if (lockTableExists) {
    const existingData = await trx('knex_migrations_lock').select()

    if (existingData.length > 0 && existingData[0].is_locked === 1) {
      logger.info(`Knex migrations are locked. Waiting for ${delayInMs / 1000} seconds to check again.`)

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, delayInMs)
      })

      const existingData = await trx('knex_migrations_lock').select()

      if (existingData.length > 0 && existingData[0].is_locked === 1) {
        // Force unlock migrations - we handle migrations manually now
        await trx('knex_migrations_lock').update({ is_locked: 0 })
      }
    }
  }

  await trx.raw("SET session_replication_role = 'origin'")
  await trx.commit()
}

export default (app: Application): void => {
  const { forceRefresh } = appConfig.vectordb

  try {
    logger.info('Setting up PostgreSQL vector database connection.')
    const oldSetup = app.setup

    const vectorDb: Knex = knex({
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

    const oldTeardown = app.teardown

    let promiseResolve, promiseReject
    app.isSetup = new Promise((resolve, reject) => {
      promiseResolve = resolve
      promiseReject = reject
    })

    app.teardown = async function (...args) {
      try {
        await vectorDb.destroy()
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
      const prepareDb = process.env.PREPARE_DATABASE === 'true'

      // Create vector database if it does not exist
      if (forceRefresh || appConfig.testEnabled || prepareDb) {
        try {
          await createDatabase(appConfig.vectordb.database)
        } catch (error) {
          logger.error('Error creating vector database: %s', error)
        }
      }

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

      await promise

      try {
        const vectorDb = app.get('vectorDbClient')

        if (forceRefresh || appConfig.testEnabled) {
          // We are running our migration:rollback here, so that tables in vector db are dropped 1st using knex.
          await checkLock(vectorDb, 0)

          logger.info('Knex migration rollback started')

          const allTables = (
            await vectorDb.raw(
              `select table_name from information_schema.tables where table_schema = '${appConfig.db.database}'`
            )
          )[0]?.map((table) => table.table_name)

          if (allTables) {
            const trx = await vectorDb.transaction()
            await trx.raw("SET session_replication_role = 'replica'")

            for (const table of allTables) {
              await trx.schema.dropTableIfExists(table)
            }

            await trx.raw("SET session_replication_role = 'origin'")
            await trx.commit()
          }

          // await vectorDb.migrate.rollback(migrationConfig, true)
          logger.info('Knex migration rollback ended')
        }

        if (forceRefresh || appConfig.testEnabled || prepareDb) {
          // We are running our migrations here, so that tables above in vector db tree are created 1st using sequelize.
          // And then knex migrations can be executed. This is because knex migrations will have foreign key dependency
          // on the tables that are created using sequelize.
          await checkLock(vectorDb, prepareDb ? 25000 : 0)

          logger.info('Vector database migration started')
          await runVectorDbMigrations(app)
          logger.info('Vector database migration ended')

          await checkLock(vectorDb, prepareDb ? 25000 : 0)
        }
      } catch (err) {
        logger.error('Knex setup error')
        logger.error(err)
        promiseReject()
        throw err
      }

      return oldSetup.apply(this, args)
    }

    app.set('vectorDbClient', vectorDb)
    logger.info('PostgreSQL vector database client configured.')
  } catch (err) {
    logger.error('Error in server-core postgres.ts')
    logger.error(err)
  }
}
