import { Knex } from 'knex'
import { v4 } from 'uuid'

import {
  instanceServerSettingPath,
  InstanceServerSettingType
} from '@etherealengine/engine/src/schemas/setting/instance-server-setting.schema'
import appConfig from '@etherealengine/server-core/src/appconfig'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const seedData: InstanceServerSettingType[] = await Promise.all(
    [
      {
        clientHost: process.env.APP_HOST || '',
        rtcStartPort: parseInt(process.env.RTC_START_PORT!),
        rtcEndPort: parseInt(process.env.RTC_END_PORT!),
        rtcPortBlockSize: parseInt(process.env.RTC_PORT_BLOCK_SIZE!),
        identifierDigits: 5,
        local: process.env.LOCAL === 'true',
        domain: process.env.INSTANCESERVER_DOMAIN || 'instanceserver.etherealengine.com',
        releaseName: process.env.RELEASE_NAME || 'local',
        port: process.env.INSTANCESERVER_PORT || '3031',
        mode: process.env.INSTANCESERVER_MODE || 'dev',
        locationName: process.env.PRELOAD_LOCATION_NAME || ''
      }
    ].map(async (item) => ({ ...item, id: v4(), createdAt: await getDateTimeSql(), updatedAt: await getDateTimeSql() }))
  )

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(instanceServerSettingPath).del()

    // Inserts seed entries
    await knex(instanceServerSettingPath).insert(seedData)
  } else {
    const existingData = await knex(instanceServerSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(instanceServerSettingPath).insert(item)
      }
    }
  }
}
