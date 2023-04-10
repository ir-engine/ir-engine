import { Knex } from 'knex'
import { v4 } from 'uuid'

import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

const TABLE_NAME = 'chargebeeSetting'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData = await Promise.all(
    [
      {
        url: process.env.CHARGEBEE_SITE + '.chargebee.com' || 'dummy.not-chargebee.com',
        apiKey: process.env.CHARGEBEE_API_KEY || null
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
      const existingData = await knex(TABLE_NAME).where('url', item.url).andWhere('apiKey', item.apiKey)
      if (existingData.length === 0) {
        await knex(TABLE_NAME).insert(item)
      }
    }
  }
}
