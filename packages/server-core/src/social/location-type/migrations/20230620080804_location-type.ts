import type { Knex } from 'knex'

import { locationTypePath } from '@etherealengine/engine/src/schemas/social/location-type.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'location_type'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, locationTypePath)
  }

  const tableExists = await knex.schema.hasTable(locationTypePath)

  if (tableExists === false) {
    await knex.schema.createTable(locationTypePath, (table) => {
      //@ts-ignore
      table.string('type', 255).notNullable().unique().collate('utf8mb4_bin').primary()
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(locationTypePath)

  if (tableExists === true) {
    await knex.schema.dropTable(locationTypePath)
  }
}
