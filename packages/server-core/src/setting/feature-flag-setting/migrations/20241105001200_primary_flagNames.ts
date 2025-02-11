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

import {
  FeatureFlagSettingType,
  featureFlagSettingPath
} from '@ir-engine/common/src/schemas/setting/feature-flag-setting.schema'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

type OldFeatureFlagSettingType = FeatureFlagSettingType & {
  flagName: string
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // as in "upgrade"

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  migrateUp: {
    const flagNameColumnExists = await knex.schema.hasColumn(featureFlagSettingPath, 'flagName')

    if (!flagNameColumnExists) {
      break migrateUp
    }

    const oldRows = await knex.select<OldFeatureFlagSettingType[]>().from(featureFlagSettingPath)
    const oldRowsByFlagName = new Map<string, OldFeatureFlagSettingType>()

    for (const oldRow of oldRows) {
      const flagName = oldRow.flagName
      const existingUpdatedAt = oldRowsByFlagName.get(flagName)?.updatedAt
      if (existingUpdatedAt != null && existingUpdatedAt > oldRow.updatedAt) {
        continue
      }
      oldRowsByFlagName.set(flagName, oldRow)
    }

    await knex.schema.dropTable(featureFlagSettingPath)

    await knex.schema.createTable(featureFlagSettingPath, (table) => {
      table.string('id').primary()

      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin').nullable().index()
      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')

      table.boolean('flagValue').notNullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })

    const newRows = [...oldRowsByFlagName.values()].map((oldRow) => {
      const { flagName: id, ...properties } = oldRow
      return {
        ...properties,
        id
      }
    })

    if (newRows.length === 0) {
      break migrateUp
    }

    await knex.insert(newRows).into(featureFlagSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  // as in "downgrade"

  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  migrateDown: {
    const flagNameColumnExists = await knex.schema.hasColumn(featureFlagSettingPath, 'flagName')
    if (flagNameColumnExists) {
      break migrateDown
    }

    const newRows = await knex.select<FeatureFlagSettingType[]>().from(featureFlagSettingPath)

    await knex.schema.dropTable(featureFlagSettingPath)

    await knex.schema.createTable(featureFlagSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('flagName').notNullable()

      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin').nullable().index()
      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')

      table.boolean('flagValue').notNullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })

    const oldRows = newRows.map((newRow) => ({
      ...newRow,
      flagName: newRow.id,
      id: uuidv4()
    }))

    if (oldRows.length === 0) {
      break migrateDown
    }

    await knex.insert(oldRows).into(featureFlagSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
