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
  const mergeChargebeeSettingPath = 'chargebee-setting'

  const tableExists = await knex.schema.hasTable(mergeChargebeeSettingPath)

  if (tableExists) {
    const recordExists = await knex.table(mergeChargebeeSettingPath).first()

    if (recordExists) {
      const taskServerSettings: EngineSettingType[] = await Promise.all(
        [
          {
            key: EngineSettings.Chargebee.Url,
            value: recordExists.url || process.env.CHARGEBEE_SITE + '.chargebee.com' || 'dummy.not-chargebee.com'
          },
          {
            key: EngineSettings.Chargebee.ApiKey,
            value: recordExists.apiKey || process.env.CHARGEBEE_API_KEY || ''
          }
        ].map(async (item) => ({
          ...item,
          id: uuidv4(),
          type: 'private' as EngineSettingType['type'],
          category: 'chargebee' as EngineSettingType['category'],
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )
      await knex.from(engineSettingPath).insert(taskServerSettings)
    }
  }

  await knex.schema.dropTableIfExists(mergeChargebeeSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
