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

import { userRelationshipPath } from '@etherealengine/common/src/schemas/user/user-relationship.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'user_relationship'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await trx.schema.hasTable(oldTableName)
  let tableExists = await trx.schema.hasTable(userRelationshipPath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await trx.schema.dropTable(userRelationshipPath)
    await trx.schema.renameTable(oldTableName, userRelationshipPath)
  }

  tableExists = await trx.schema.hasTable(userRelationshipPath)

  if (!tableExists && !oldNamedTableExists) {
    await trx.schema.createTable(userRelationshipPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').nullable().index()
      //@ts-ignore
      table.uuid('relatedUserId').collate('utf8mb4_bin').nullable().index()
      table.string('userRelationshipType', 255).nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.unique(['userId', 'relatedUserId'])

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('relatedUserId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table
        .foreign('userRelationshipType')
        .references('type')
        .inTable('user-relationship-type')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
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

  const tableExists = await trx.schema.hasTable(userRelationshipPath)

  if (tableExists === true) {
    await trx.schema.dropTable(userRelationshipPath)
  }

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}
