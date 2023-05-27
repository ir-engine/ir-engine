import { Knex } from 'knex'
import { v4 } from 'uuid'

import { routePath } from '@etherealengine/engine/src/schemas/route/route.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

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
      },
      {
        project: 'default-project',
        route: '/chat'
      }
    ].map(async (item) => ({ ...item, id: v4(), createdAt: await getDateTimeSql(), updatedAt: await getDateTimeSql() }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(routePath).del()

    // Inserts seed entries
    await knex(routePath).insert(seedData)
  } else {
    for (const item of seedData) {
      const existingData = await knex(routePath).where('project', item.project).andWhere('route', item.route)
      if (existingData.length === 0) {
        await knex(routePath).insert(item)
      }
    }
  }
}
