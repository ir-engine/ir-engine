import { Knex } from 'knex'
import { v4 } from 'uuid'

import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData = await Promise.all(
    [
      {
        count: 200,
        type: 'activeParties'
      },
      {
        count: 100,
        type: 'activeInstances'
      },
      {
        count: 150,
        type: 'activeLocations'
      },
      {
        count: 120,
        type: 'activeScenes'
      },
      {
        count: 110,
        type: 'channelUsers'
      },
      {
        count: 200,
        type: 'instanceUsers'
      }
    ].map(async (item) => ({ ...item, id: v4(), createdAt: await getDateTimeSql(), updatedAt: await getDateTimeSql() }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex('analytics').del()

    // Inserts seed entries
    await knex('analytics').insert(seedData)
  } else {
    for (const item of seedData) {
      const existingData = await knex('analytics').where('count', item.count).andWhere('type', item.type)
      if (existingData.length === 0) {
        await knex('analytics').insert(item)
      }
    }
  }
}
