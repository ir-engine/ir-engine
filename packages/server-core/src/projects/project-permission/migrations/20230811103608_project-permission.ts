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

import { projectPermissionPath } from '@etherealengine/engine/src/schemas/projects/project-permission.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'project_permission'

  // Added transaction here in order to ensure both below queries run on same pool.
  // https://github.com/knex/knex/issues/218#issuecomment-56686210
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  const oldNamedTableExists = await trx.schema.hasTable(oldTableName)
  let tableExists = await trx.schema.hasTable(projectPermissionPath)
  if (oldNamedTableExists) {
    // In case sequelize creates the new table before we migrate the old table
    if (tableExists) await trx.schema.dropTable(projectPermissionPath)
    await trx.schema.renameTable(oldTableName, projectPermissionPath)
  }

  tableExists = await trx.schema.hasTable(projectPermissionPath)

  if (tableExists) {
    const hasIdColum = await trx.schema.hasColumn(projectPermissionPath, 'id')
    const hasProjectIdColumn = await trx.schema.hasColumn(projectPermissionPath, 'projectId')
    const hasUserIdColumn = await trx.schema.hasColumn(projectPermissionPath, 'userId')
    if (!(hasIdColum && hasProjectIdColumn && hasUserIdColumn)) {
      await trx.schema.dropTable(projectPermissionPath)
      tableExists = false
    }
  }

  if (!tableExists && !oldNamedTableExists) {
    await trx.schema.createTable(projectPermissionPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('projectId').collate('utf8mb4_bin').defaultTo(null).index()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').defaultTo(null).index()
      table.string('type', 255).defaultTo(null).index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('projectId').references('id').inTable('project').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('userId').references('id').inTable('user').onDelete('CASCADE').onUpdate('CASCADE')
      table
        .foreign('type')
        .references('type')
        .inTable('project-permission-type')
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

  const tableExists = await trx.schema.hasTable(projectPermissionPath)

  if (tableExists === true) {
    await trx.schema.dropTable(projectPermissionPath)
  }

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}
