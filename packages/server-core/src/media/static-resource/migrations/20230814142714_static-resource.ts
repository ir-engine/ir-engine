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

import { staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'static_resource'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await trx.schema.hasTable(oldTableName)
  let tableExists = await trx.schema.hasTable(staticResourcePath)

  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await trx.schema.dropTable(staticResourcePath)
    await trx.schema.renameTable(oldTableName, staticResourcePath)
  }

  tableExists = await trx.schema.hasTable(staticResourcePath)

  if (tableExists) {
    const hasIdColum = await trx.schema.hasColumn(staticResourcePath, 'id')
    const hasUserIdColumn = await trx.schema.hasColumn(staticResourcePath, 'userId')
    if (!(hasUserIdColumn && hasIdColum)) {
      await trx.schema.dropTable(staticResourcePath)
      tableExists = false
    }
  }

  if (!tableExists && !oldNamedTableExists) {
    await trx.schema.createTable(staticResourcePath, (table) => {
      table.string('id', 36).notNullable().primary()
      table.string('sid', 255).notNullable()
      table.string('hash', 255).notNullable()
      table.string('url', 255).defaultTo(null)
      table.string('key', 255).defaultTo(null)
      table.string('mimeType', 255).defaultTo(null)
      table.json('metadata').defaultTo(null)
      table.string('project', 255).defaultTo(null)
      table.string('driver', 255).defaultTo(null)
      table.string('licensing', 255).defaultTo(null)
      table.string('attribution', 255).defaultTo(null)
      table.json('tags').defaultTo(null)
      table.json('stats').defaultTo(null)
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
      table.string('userId', 36).defaultTo(null)
      table.index('userId')

      // Foreign keys
      table.foreign('userId').references('user.id').onDelete('SET NULL').onUpdate('CASCADE')
    })

    await trx.raw('SET FOREIGN_KEY_CHECKS=1')

    await trx.commit()
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(staticResourcePath)
}
