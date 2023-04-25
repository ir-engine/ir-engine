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
  const tableExists = await knex.schema.hasTable(matchInstancePath)

  if (tableExists === true) {
    await knex.schema.dropTable(matchInstancePath)
  }
}
