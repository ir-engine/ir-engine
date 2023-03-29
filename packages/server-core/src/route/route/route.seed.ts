import { Knex } from 'knex'
import { v4 } from 'uuid'

import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  // Deletes ALL existing entries
  if (forceRefresh || testEnabled) {
    await knex('route').del()
  }

  const seedData = await Promise.all(
    [
      {
        project: 'default-project',
        route: '/'
      },
      {
        project: 'default-project',
        route: '/location'
      },
      {
        project: 'default-project',
        route: '/admin'
      },
      {
        project: 'default-project',
        route: '/auth'
      },
      {
        project: 'default-project',
        route: '/editor'
      },
      {
        project: 'default-project',
        route: '/studio'
      },
      {
        project: 'default-project',
        route: '/capture'
      }
    ].map(async (item) => ({ ...item, id: v4(), createdAt: await getDateTimeSql(), updatedAt: await getDateTimeSql() }))
  )

  // Inserts seed entries
  await knex('route').insert(seedData)
}
