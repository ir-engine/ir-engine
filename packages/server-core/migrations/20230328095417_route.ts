import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const routeTableExists = await knex.schema.hasTable('route')

  if (routeTableExists === false) {
    await knex.schema.createTable('route', (table) => {
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
  await knex.schema.dropTable('route')
}
