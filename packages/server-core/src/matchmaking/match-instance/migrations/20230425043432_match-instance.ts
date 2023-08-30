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

import { matchInstancePath } from '@etherealengine/engine/src/schemas/matchmaking/match-instance.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'match_instance'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, matchInstancePath)

    const oldGameModeColumnExists = await knex.schema.hasColumn(matchInstancePath, 'gamemode')
    if (oldGameModeColumnExists) {
      await knex.schema.alterTable(matchInstancePath, async (table) => {
        table.renameColumn('gamemode', 'gameMode')
      })
    }

    const oldInstanceServerColumnExists = await knex.schema.hasColumn(matchInstancePath, 'instanceserver')
    if (oldInstanceServerColumnExists) {
      await knex.schema.alterTable(matchInstancePath, async (table) => {
        table.renameColumn('instanceserver', 'instanceServer')
      })
    }
  }

  const tableExists = await knex.schema.hasTable(matchInstancePath)

  if (tableExists === false) {
    await knex.schema.createTable(matchInstancePath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('connection', 255).notNullable().unique()
      table.string('gameMode', 255).nullable()
      table.string('instanceServer', 36).nullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await trx.schema.hasTable(matchInstancePath)

  if (tableExists === true) {
    await trx.schema.dropTable(matchInstancePath)
  }

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}
