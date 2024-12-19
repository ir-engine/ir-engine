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

import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  await knex.schema.alterTable(engineSettingPath, (table) => {
    table.string('dataType', 10).defaultTo('string')
  })

  const engineSettings = await knex(engineSettingPath).select('id', 'value')
  const engineSettingDataTypeUpdates = engineSettings.map((setting) => {
    // update setting value to boolean if it is '0' or '1'
    if (setting.value == '0' || setting.value == '1') {
      return knex(engineSettingPath)
        .where('id', setting.id)
        .update('dataType', 'boolean')
        .update('value', setting.value === '1' ? 'true' : 'false')
    }
    const dataType = getDataType(setting.value)
    return knex(engineSettingPath).where('id', setting.id).update('dataType', dataType)
  })
  await Promise.all(engineSettingDataTypeUpdates)

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const dataTypeColumnExists = await knex.schema.hasColumn(engineSettingPath, 'dataType')

  if (dataTypeColumnExists) {
    await knex.schema.alterTable(engineSettingPath, async (table) => {
      table.dropColumn('dataType')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
