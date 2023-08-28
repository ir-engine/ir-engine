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

import { identityProviderPath } from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'identity_provider'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await trx.schema.hasTable(oldTableName)
  let tableExists = await trx.schema.hasTable(identityProviderPath)

  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await trx.schema.dropTable(identityProviderPath)
    await trx.schema.renameTable(oldTableName, identityProviderPath)
  }

  tableExists = await trx.schema.hasTable(identityProviderPath)

  if (tableExists === false) {
    await trx.schema.createTable(identityProviderPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('token', 255).collate('utf8mb4_bin').defaultTo(null).unique()
      table.string('accountIdentifier', 255).defaultTo(null)
      table.string('oauthToken', 255).defaultTo(null)
      table.string('type', 255).notNullable()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      // unique combinations
      table.unique(['userId', 'token'], { indexName: 'identity_provider_user_id_token' })
      table.unique(['userId', 'type'], { indexName: 'identity_provider_user_id_type' })

      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
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

  const tableExists = await trx.schema.hasTable(identityProviderPath)

  if (tableExists === true) {
    await trx.schema.dropTable(identityProviderPath)
  }

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}
