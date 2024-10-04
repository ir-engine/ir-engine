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

import { defaultWebRTCSettings } from '@ir-engine/common/src/constants/DefaultWebRTCSettings'
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

  const coilSeedData = await generateSeedData(
    [
      { key: EngineSettings.Coil.PaymentPointer, value: process.env.COIL_PAYMENT_POINTER || '' },
      { key: EngineSettings.Coil.ClientId, value: process.env.COIL_API_CLIENT_ID || '' },
      { key: EngineSettings.Coil.ClientSecret, value: process.env.COIL_API_CLIENT_SECRET || '' }
    ],
    'coil'
  )
  const instanceServerSeedData = await generateSeedData(
    [
      {
        key: EngineSettings.InstanceServer.ClientHost,
        value: process.env.APP_HOST || ''
      },
      {
        key: EngineSettings.InstanceServer.RtcStartPort,
        value: process.env.RTC_START_PORT || ''
      },
      {
        key: EngineSettings.InstanceServer.RtcEndPort,
        value: process.env.RTC_END_PORT || ''
      },
      {
        key: EngineSettings.InstanceServer.RtcPortBlockSize,
        value: process.env.RTC_PORT_BLOCK_SIZE || ''
      },
      {
        key: EngineSettings.InstanceServer.IdentifierDigits,
        value: '5'
      },
      {
        key: EngineSettings.InstanceServer.Local,
        value: `${process.env.LOCAL === 'true'}`
      },
      {
        key: EngineSettings.InstanceServer.Domain,
        value: process.env.INSTANCESERVER_DOMAIN || 'instanceserver.etherealengine.com'
      },
      {
        key: EngineSettings.InstanceServer.ReleaseName,
        value: process.env.RELEASE_NAME || 'local'
      },
      {
        key: EngineSettings.InstanceServer.Port,
        value: process.env.INSTANCESERVER_PORT || '3031'
      },
      {
        key: EngineSettings.InstanceServer.Mode,
        value: process.env.INSTANCESERVER_MODE || 'dev'
      },
      {
        key: EngineSettings.InstanceServer.LocationName,
        value: process.env.PRELOAD_LOCATION_NAME || ''
      },
      {
        key: EngineSettings.InstanceServer.WebRTCSettings,
        value: JSON.stringify(defaultWebRTCSettings)
      },
      {
        key: EngineSettings.InstanceServer.ShutdownDelayMs,
        value: process.env.INSTANCESERVER_SHUTDOWN_DELAY_MS || '0'
      }
    ],
    'instance-server'
  )

  const seedData: EngineSettingType[] = [
    ...taskServerSeedData,
    ...chargebeeSettingSeedData,
    ...coilSeedData,
    ...instanceServerSeedData
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

async function generateSeedData(
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
