import type { Knex } from 'knex'

import { routePath } from '@etherealengine/engine/src/schemas/route/route.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(routePath)

  if (tableExists === false) {
    await knex.schema.createTable(routePath, (table) => {
      table.string('id', 36).primary()
      table.string('project', 255).nullable()
      table.string('route', 255).nullable()
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
  const tableExists = await knex.schema.hasTable(routePath)

  if (tableExists === true) {
    await knex.schema.dropTable(routePath)
  }
}
