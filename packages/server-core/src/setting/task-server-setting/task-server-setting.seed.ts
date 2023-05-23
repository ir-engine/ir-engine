import { Knex } from 'knex'
import { v4 } from 'uuid'

import { taskServerSettingPath } from '@etherealengine/engine/src/schemas/setting/task-server-setting.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData = await Promise.all(
    [
      {
        port: process.env.TASKSERVER_PORT || 3030,
        processInterval: process.env.TASKSERVER_PROCESS_INTERVAL_SECONDS || 30
      }
    ].map(async (item) => ({ ...item, id: v4(), createdAt: await getDateTimeSql(), updatedAt: await getDateTimeSql() }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(taskServerSettingPath).del()

    // Inserts seed entries
    await knex(taskServerSettingPath).insert(seedData)
  } else {
    for (const item of seedData) {
      const existingData = await knex(taskServerSettingPath)
        .where('port', item.port)
        .andWhere('processInterval', item.processInterval)
      if (existingData.length === 0) {
        await knex(taskServerSettingPath).insert(item)
      }
    }
  }
}
