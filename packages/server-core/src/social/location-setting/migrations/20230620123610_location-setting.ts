/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import type { Knex } from 'knex'

import { locationSettingPath } from '@etherealengine/engine/src/schemas/social/location-setting.schema'
import { locationTypePath } from '@etherealengine/engine/src/schemas/social/location-type.schema'
import { locationPath } from '@etherealengine/engine/src/schemas/social/location.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'location_settings'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, locationSettingPath)
  }

  const tableExists = await knex.schema.hasTable(locationSettingPath)

  if (tableExists === false) {
    // Added transaction here in order to ensure both below queries run on same pool.
    // https://github.com/knex/knex/issues/218#issuecomment-56686210
    const trx = await knex.transaction()
    await trx.raw('SET FOREIGN_KEY_CHECKS=0')

    await trx.schema.createTable(locationSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()

      table.boolean('videoEnabled').defaultTo(false)
      table.boolean('audioEnabled').defaultTo(false)
      table.boolean('screenSharingEnabled').defaultTo(false)
      table.boolean('faceStreamingEnabled').defaultTo(false)

      //@ts-ignore
      table.uuid('locationId').collate('utf8mb4_bin').nullable().index()
      table.string('locationType', 255).nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('locationId').references('id').inTable(locationPath).onDelete('CASCADE').onUpdate('CASCADE')
      table
        .foreign('locationType')
        .references('type')
        .inTable(locationTypePath)
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
    })

    await trx.raw('SET FOREIGN_KEY_CHECKS=1')
    await trx.commit()
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await trx.schema.hasTable(locationSettingPath)

  if (tableExists === true) {
    await trx.schema.dropTable(locationSettingPath)
  }

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}
