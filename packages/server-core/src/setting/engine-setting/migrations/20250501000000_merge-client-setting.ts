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

import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schema.type.module'
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
  const clientSettingPath = 'client-setting'
  const isClientTableExists = await knex.schema.hasTable(clientSettingPath)

  if (isClientTableExists) {
    const clientSettingRecord = await knex.table(clientSettingPath).first()

    if (clientSettingRecord) {
      // Fields to exclude from migration
      const excludedFields = ['key8thWall', 'themeModes', 'themeSettings']

      // Create a clean object without excluded fields
      const clientData = { ...clientSettingRecord }
      excludedFields.forEach((field) => delete clientData[field])

      // Handle JSON fields
      try {
        // Parse JSON fields if they exist
        if (clientData.appSocialLinks) {
          clientData.appSocialLinks = JSON.parse(clientData.appSocialLinks)
        }
        if (clientData.mediaSettings) {
          clientData.mediaSettings = JSON.parse(clientData.mediaSettings)
        }
      } catch (error) {
        console.error('Error parsing JSON fields:', error)
      }

      // Flatten the object
      const flattenedClientData = flattenObjectToArray(clientData)

      // Create engine settings entries
      const clientSettings: EngineSettingType[] = await Promise.all(
        flattenedClientData.map(async (clientSetting) => ({
          key: clientSetting.key,
          value: clientSetting.value || '',
          id: uuidv4(),
          dataType: getDataType(`${clientSetting.value}`),
          type: 'public' as EngineSettingType['type'],
          category: 'client',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )

      await knex.from(engineSettingPath).insert([...clientSettings])
    }
  }

  await knex.schema.dropTableIfExists(clientSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  // If needed, implement a rollback strategy
  // This would involve retrieving client settings from engine-setting and restoring them to client-setting
}
