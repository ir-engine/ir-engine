import { Knex } from 'knex'
import { v4 } from 'uuid'

import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

const TABLE_NAME = 'redisSetting'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData = await Promise.all(
    [
      {
        enabled: process.env.REDIS_ENABLED === 'true',
        address: process.env.REDIS_ADDRESS,
        port: process.env.REDIS_PORT,
        password:
          process.env.REDIS_PASSWORD == '' || process.env.REDIS_PASSWORD == null ? null : process.env.REDIS_PASSWORD
      }
    ].map(async (item) => ({ ...item, id: v4(), createdAt: await getDateTimeSql(), updatedAt: await getDateTimeSql() }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(TABLE_NAME).del()

    // Inserts seed entries
    await knex(TABLE_NAME).insert(seedData)
  } else {
    for (const item of seedData) {
      const existingData = await knex(TABLE_NAME)
        .where('enabled', item.enabled)
        .andWhere('address', item.address)
        .andWhere('port', item.port)
        .andWhere('password', item.password)
      if (existingData.length === 0) {
        await knex(TABLE_NAME).insert(item)
      }
    }
  }
}
