import type { Knex } from 'knex'

import { analyticsPath } from '@etherealengine/engine/src/schemas/analytics/analytics.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(analyticsPath)

  if (tableExists === false) {
    await knex.schema.createTable(analyticsPath, (table) => {
      table.string('id', 36).primary()
      table.integer('count').nullable()
      table.string('type', 255).nullable()
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
  const tableExists = await knex.schema.hasTable(analyticsPath)

  if (tableExists === true) {
    await knex.schema.dropTable(analyticsPath)
  }
}
