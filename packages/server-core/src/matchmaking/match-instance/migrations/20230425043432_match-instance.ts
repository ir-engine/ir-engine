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
  }

  const tableExists = await knex.schema.hasTable(matchInstancePath)

  if (tableExists === false) {
    await knex.schema.createTable(matchInstancePath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('connection', 255).notNullable().unique()
      table.string('gamemode', 255).nullable()
      table.string('instanceserver', 36).nullable()
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
  const tableExists = await knex.schema.hasTable(matchInstancePath)

  if (tableExists === true) {
    await knex.schema.dropTable(matchInstancePath)
  }
}
