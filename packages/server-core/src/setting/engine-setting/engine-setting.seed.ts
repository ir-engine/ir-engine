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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import appConfig from '@ir-engine/server-core/src/appconfig'

export async function seed(knex: Knex): Promise<void> {
  const { testEnabled } = appConfig
  const { forceRefresh } = appConfig.db

  const taskServerSeedData = await generateSeedData(
    [
      { key: EngineSettings.TaskServer.Port, value: process.env.TASKSERVER_PORT || '3030' },
      { key: EngineSettings.TaskServer.ProcessInterval, value: process.env.TASKSERVER_PROCESS_INTERVAL_SECONDS || '30' }
    ],
    'task-server'
  )

  const chargebeeSettingSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Chargebee.Url,
        value: process.env.CHARGEBEE_SITE + '.chargebee.com' || 'dummy.not-chargebee.com'
      },
      { key: EngineSettings.Chargebee.ApiKey, value: process.env.CHARGEBEE_API_KEY || '' }
    ],
    'chargebee'
  )
  const zendeskSettingSeedData: EngineSettingType[] = await Promise.all(
    [
      {
        key: EngineSettings.Zendesk.Name,
        value: process.env.ZENDESK_KEY_NAME || ''
      },
      {
        key: EngineSettings.Zendesk.Secret,
        value: process.env.ZENDESK_SECRET || ''
      },
      {
        key: EngineSettings.Zendesk.Kid,
        value: process.env.ZENDESK_KID || ''
      }
    ].map(async (item) => ({
      ...item,
      id: uuidv4(),
      type: 'private' as EngineSettingType['type'],
      category: 'zendesk' as EngineSettingType['category'],
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )

  const coilSeedData = await generateSeedData(
    [
      { key: EngineSettings.Coil.PaymentPointer, value: process.env.COIL_PAYMENT_POINTER || '' },
      { key: EngineSettings.Coil.ClientId, value: process.env.COIL_API_CLIENT_ID || '' },
      { key: EngineSettings.Coil.ClientSecret, value: process.env.COIL_API_CLIENT_SECRET || '' }
    ],
    'coil'
  )

  const metabaseSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Metabase.SiteUrl,
        value: process.env.METABASE_SITE_URL || ''
      },
      {
        key: EngineSettings.Metabase.SecretKey,
        value: process.env.METABASE_SECRET_KEY || ''
      },
      {
        key: EngineSettings.Metabase.Expiration,
        value: process.env.METABASE_EXPIRATION || ''
      },
      {
        key: EngineSettings.Metabase.CrashDashboardId,
        value: process.env.METABASE_CRASH_DASHBOARD_ID || ''
      },
      {
        key: EngineSettings.Metabase.Environment,
        value: process.env.METABASE_ENVIRONMENT || ''
      }
    ],
    'metabase'
  )

  const redisSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Redis.Address,
        value: process.env.REDIS_ADDRESS || 'localhost'
      },
      {
        key: EngineSettings.Redis.Password,
        value: process.env.REDIS_PASSWORD || ''
      },
      {
        key: EngineSettings.Redis.Port,
        value: process.env.REDIS_PORT || '6379'
      },
      {
        key: EngineSettings.Redis.Enabled,
        value: process.env.REDIS_ENABLED || ''
      }
    ],
    'redis'
  )

  const helmSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.Helm.Main,
        value: ''
      },
      {
        key: EngineSettings.Helm.Builder,
        value: ''
      }
    ],
    'helm'
  )

  const seedData: EngineSettingType[] = [
    ...taskServerSeedData,
    ...chargebeeSettingSeedData,
    ...coilSeedData,
    ...metabaseSeedData,
    ...redisSeedData,
    ...zendeskSettingSeedData,
    ...helmSeedData
  ]

  if (forceRefresh || testEnabled) {
    // Deletes ALL existing entries
    await knex(engineSettingPath).del()

    // Inserts seed entries
    await knex(engineSettingPath).insert(seedData)
  } else {
    const existingData = await knex(engineSettingPath).count({ count: '*' })

    if (existingData.length === 0 || existingData[0].count === 0) {
      for (const item of seedData) {
        await knex(engineSettingPath).insert(item)
      }
    }
  }
}

export async function generateSeedData(
  items: { key: string; value: string }[],
  category: EngineSettingType['category'],
  type: EngineSettingType['type'] = 'private'
): Promise<EngineSettingType[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      id: uuidv4(),
      type: type,
      category: category,
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    }))
  )
}
