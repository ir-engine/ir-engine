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

import { Application } from '../../../declarations'
import multiLogger from '../../ServerLogger'

import appConfig from '@ir-engine/server-core/src/appconfig'

const logger = multiLogger.child({ component: 'server-core:vector-db-migrations' })

import { Client } from 'pg'

export async function createDatabase(dbName: string) {
  const client = new Client({
    user: appConfig.vectordb.username,
    password: appConfig.vectordb.password,
    host: appConfig.vectordb.host,
    port: parseInt(appConfig.vectordb.port),
    database: 'postgres'
  })

  try {
    await client.connect()
    logger.info('Connected to default PostgreSQL database.')

    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`)
    if (res.rows.length === 0) {
      logger.info(`Database '${dbName}' does not exist. Creating...`)
      await client.query(`CREATE DATABASE "${dbName}"`)
      logger.info(`Database '${dbName}' created successfully.`)
    } else {
      logger.info(`Database '${dbName}' already exists.`)
    }
  } catch (err) {
    console.error('Error creating database:', err)
  } finally {
    await client.end()
    logger.info('Disconnected from PostgreSQL.')
  }
}

/**
 * Run vector database migrations manually
 */
export const runVectorDbMigrations = async (app: Application): Promise<void> => {
  try {
    const vectorDb = app.get('vectorDbClient')
    if (!vectorDb) {
      logger.warn('Vector database client not available, skipping migrations')
      return
    }

    logger.info('Running vector database migrations...')

    // Check if migrations table exists
    const migrationsTableExists = await vectorDb.schema.hasTable('knex_migrations_vector')
    if (!migrationsTableExists) {
      await vectorDb.schema.createTable('knex_migrations_vector', (table: any) => {
        table.increments('id')
        table.string('name')
        table.integer('batch')
        table.timestamp('migration_time').defaultTo(vectorDb.fn.now())
      })
      logger.info('Created vector migrations table')
    }

    // Import and run the migration manually
    try {
      const { up } = await import('./migrations/20250122000000_static-resource-vector')

      // Check if this migration has already been run
      const existingMigration = await vectorDb('knex_migrations_vector')
        .where('name', '20250122000000_static-resource-vector.ts')
        .first()

      if (!existingMigration) {
        logger.info('Running static-resource-vector migration...')
        await up(vectorDb)

        // Record the migration
        await vectorDb('knex_migrations_vector').insert({
          name: '20250122000000_static-resource-vector.ts',
          batch: 1
        })

        logger.info('Vector database migration completed successfully')
      } else {
        logger.info('Vector database is already up to date')
      }
    } catch (migrationError) {
      logger.error('Error running vector database migration:', migrationError)
      throw migrationError
    }
  } catch (error) {
    logger.error('Error setting up vector database migrations:', error)
    throw error
  }
}

/**
 * Rollback vector database migrations manually
 */
export const rollbackVectorDbMigrations = async (app: Application): Promise<void> => {
  try {
    const vectorDb = app.get('vectorDbClient')
    if (!vectorDb) {
      logger.warn('Vector database client not available, skipping rollback')
      return
    }

    logger.info('Rolling back vector database migrations...')

    // Check if the migration exists
    const existingMigration = await vectorDb('knex_migrations_vector')
      .where('name', '20250122000000_static-resource-vector.ts')
      .first()

    if (existingMigration) {
      try {
        const { down } = await import('./migrations/20250122000000_static-resource-vector')

        logger.info('Rolling back static-resource-vector migration...')
        await down(vectorDb)

        // Remove the migration record
        await vectorDb('knex_migrations_vector').where('name', '20250122000000_static-resource-vector.ts').del()

        logger.info('Vector database migration rollback completed successfully')
      } catch (migrationError) {
        logger.error('Error rolling back vector database migration:', migrationError)
        throw migrationError
      }
    } else {
      logger.info('No vector database migrations to rollback')
    }
  } catch (error) {
    logger.error('Error rolling back vector database migrations:', error)
    throw error
  }
}

/**
 * Get vector database migration status
 */
export const getVectorDbMigrationStatus = async (app: Application): Promise<any> => {
  try {
    const vectorDb = app.get('vectorDbClient')
    if (!vectorDb) {
      logger.warn('Vector database client not available')
      return { status: 'unavailable' }
    }

    // Check if migrations table exists
    const migrationsTableExists = await vectorDb.schema.hasTable('knex_migrations_vector')
    if (!migrationsTableExists) {
      return {
        status: 'available',
        currentVersion: 'none',
        completedMigrations: []
      }
    }

    // Get list of completed migrations
    const completedMigrations = await vectorDb('knex_migrations_vector').select('*').orderBy('id')

    return {
      status: 'available',
      currentVersion:
        completedMigrations.length > 0 ? completedMigrations[completedMigrations.length - 1].name : 'none',
      completedMigrations: completedMigrations.map((m: any) => m.name)
    }
  } catch (error) {
    logger.error('Error getting vector database migration status:', error)
    return { status: 'error', error: error.message }
  }
}
