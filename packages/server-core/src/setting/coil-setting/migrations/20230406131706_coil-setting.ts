import type { Knex } from 'knex'

import { coilSettingPath } from '@etherealengine/engine/src/schemas/setting/coil-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'coilSetting'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, coilSettingPath)
  }

  const tableExists = await knex.schema.hasTable(coilSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(coilSettingPath, (table) => {
      table.string('id', 36).primary()
      table.string('paymentPointer', 255).nullable()
      table.string('clientId', 255).nullable()
      table.string('clientSecret', 255).nullable()
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
  const tableExists = await knex.schema.hasTable(coilSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(coilSettingPath)
  }
}
