import type { Knex } from 'knex'

import { chargebeeSettingPath } from '@etherealengine/engine/src/schemas/setting/chargebee-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'chargebeeSetting'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, chargebeeSettingPath)
  }

  const tableExists = await knex.schema.hasTable(chargebeeSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(chargebeeSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('url', 255).nullable()
      table.string('apiKey', 255).nullable()
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
  const tableExists = await knex.schema.hasTable(chargebeeSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(chargebeeSettingPath)
  }
}
