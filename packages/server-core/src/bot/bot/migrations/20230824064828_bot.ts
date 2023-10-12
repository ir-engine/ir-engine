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

import { botPath } from '@etherealengine/engine/src/schemas/bot/bot.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await trx.schema.hasTable(botPath)

  if (tableExists === false) {
    await trx.schema.createTable(botPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('name', 255).notNullable()
      table.string('description', 255).defaultTo(null)
      //@ts-ignore
      table.uuid('instanceId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      //@ts-ignore
      table.uuid('locationId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin').defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('instanceId').references('id').inTable('instance').onDelete('SET NULL').onUpdate('CASCADE')
      table.foreign('locationId').references('id').inTable('location').onDelete('SET NULL').onUpdate('CASCADE')
      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    })
  }

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await trx.schema.hasTable(botPath)

  if (tableExists === true) {
    await trx.schema.dropTable(botPath)
  }

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}
