import type { Knex } from 'knex'

import { emailSettingPath } from '@etherealengine/engine/src/schemas/setting/email-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'emailSetting'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, emailSettingPath)
  }

  const tableExists = await knex.schema.hasTable(emailSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(emailSettingPath, (table) => {
      table.string('id', 36).primary()
      table.json('smtp').nullable()
      table.string('from', 255).nullable()
      table.json('subject').nullable()
      table.integer('smsNameCharacterLimit').nullable()
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
  const tableExists = await knex.schema.hasTable(emailSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(emailSettingPath)
  }
}
