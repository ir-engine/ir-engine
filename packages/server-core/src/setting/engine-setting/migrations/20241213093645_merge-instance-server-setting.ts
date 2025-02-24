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

import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { flattenObjectToArray } from '@ir-engine/common/src/utils/jsonHelperUtils'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const instanceServerSettingPath = 'instance-server-setting'

  const tableExists = await knex.schema.hasTable(instanceServerSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(instanceServerSettingPath).first()

    if (recordExists) {
      const webRTCSettings = recordExists.webRTCSettings || {}
      const webRtcSettings = flattenObjectToArray(
        typeof webRTCSettings == 'string' ? JSON.parse(webRTCSettings) : webRTCSettings
      )
      const instanceServerSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.InstanceServer.ClientHost,
            value: recordExists.clientHost || process.env.APP_HOST || ''
          },
          {
            key: EngineSettings.InstanceServer.RtcStartPort,
            value: recordExists.RtcStartPort || parseInt(process.env.RTC_START_PORT!)
          },
          {
            key: EngineSettings.InstanceServer.RtcEndPort,
            value: recordExists.RtcEndPort || parseInt(process.env.RTC_END_PORT!)
          },
          {
            key: EngineSettings.InstanceServer.RtcPortBlockSize,
            value: recordExists.RtcPortBlockSize || parseInt(process.env.RTC_PORT_BLOCK_SIZE!)
          },
          {
            key: EngineSettings.InstanceServer.IdentifierDigits,
            value: recordExists.IdentifierDigits || 5
          },
          {
            key: EngineSettings.InstanceServer.Local,
            value: recordExists.local || process.env.LOCAL === 'true'
          },
          {
            key: EngineSettings.InstanceServer.Domain,
            value: recordExists.domain || process.env.INSTANCESERVER_DOMAIN || 'instanceserver.etherealengine.com'
          },
          {
            key: EngineSettings.InstanceServer.ReleaseName,
            value: recordExists.releaseName || process.env.RELEASE_NAME || 'local'
          },
          {
            key: EngineSettings.InstanceServer.Port,
            value: recordExists.port || process.env.INSTANCESERVER_PORT || '3031'
          },
          {
            key: EngineSettings.InstanceServer.Mode,
            value: recordExists.mode || process.env.INSTANCESERVER_MODE || 'dev'
          },
          {
            key: EngineSettings.InstanceServer.LocationName,
            value: recordExists.locationName || process.env.PRELOAD_LOCATION_NAME || ''
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          dataType: getDataType(`${item.value}`),
          type: 'private' as EngineSettingType['type'],
          category: 'instance-server',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      const instanceServerWebRtc: EngineSettingType[] = await Promise.all(
        webRtcSettings.map(async ({ key, value }) => ({
          id: uuidv4(),
          key,
          value: `${value}`, // for some reason the boolean value are converted to 0 and 1 in db , so putt in string case keep it true/false
          jsonKey: EngineSettings.InstanceServer.WebRTCSettings,
          dataType: getDataType(`${value}`),
          type: 'private' as EngineSettingType['type'],
          category: 'instance-server-webrtc',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      await knex.from(engineSettingPath).insert([...instanceServerSettings, ...instanceServerWebRtc])
    }
  }

  await knex.schema.dropTableIfExists(instanceServerSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
