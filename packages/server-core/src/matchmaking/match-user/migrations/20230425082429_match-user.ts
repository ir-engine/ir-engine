import type { Knex } from 'knex'

import { matchUserPath } from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'match_user'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, matchUserPath)
  }

  const tableExists = await knex.schema.hasTable(matchUserPath)

  if (tableExists === false) {
    await knex.schema.createTable(matchUserPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      //@ts-ignore
      table.uuid('ticketId').collate('utf8mb4_bin').nullable()
      table.string('gamemode', 255).nullable()
      table.string('connection', 255).nullable()
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').nullable().index()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(matchUserPath)

  if (tableExists === true) {
    await knex.schema.dropTable(matchUserPath)
  }
}
