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

import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Check if the IP geolocation settings already exist in database
  const existingSettings = await knex
    .from(engineSettingPath)
    .whereIn('key', [EngineSettings.Server.IpGeolocation.ApiUrl, EngineSettings.Server.IpGeolocation.ApiToken])
    .andWhere('category', 'server')
    .select('key')

  // Create a map of existing settings for easy lookup
  const existingKeys = new Set(existingSettings.map((setting) => setting.key))

  // Prepare settings to insert
  const settingsToInsert: EngineSettingType[] = []

  if (!existingKeys.has(EngineSettings.Server.IpGeolocation.ApiUrl)) {
    settingsToInsert.push({
      id: uuidv4(),
      key: EngineSettings.Server.IpGeolocation.ApiUrl,
      value: process.env.IP_GEOLOCATION_API_URL || 'https://api.ipinfo.io/lite',
      dataType: 'string',
      type: 'private',
      category: 'server',
      jsonKey: '',
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    })
  }

  if (!existingKeys.has(EngineSettings.Server.IpGeolocation.ApiToken)) {
    settingsToInsert.push({
      id: uuidv4(),
      key: EngineSettings.Server.IpGeolocation.ApiToken,
      value: process.env.IP_GEOLOCATION_API_TOKEN || '',
      dataType: 'string',
      type: 'private',
      category: 'server',
      jsonKey: '',
      createdAt: await getDateTimeSql(),
      updatedAt: await getDateTimeSql()
    })
  }

  // Insert all settings in a single operation if any need to be inserted
  if (settingsToInsert.length > 0) {
    await knex.from(engineSettingPath).insert(settingsToInsert)
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex
    .from(engineSettingPath)
    .whereIn('key', [EngineSettings.Server.IpGeolocation.ApiUrl, EngineSettings.Server.IpGeolocation.ApiToken])
    .andWhere('category', 'server')
    .delete()
}
