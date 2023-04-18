import type { Knex } from 'knex'

import { taskServerSettingPath } from '@etherealengine/engine/src/schemas/setting/task-server-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'taskServerSetting'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, taskServerSettingPath)
  }

  const tableExists = await knex.schema.hasTable(taskServerSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(taskServerSettingPath, (table) => {
      table.string('id', 36).primary()
      table.string('port', 255).nullable()
      table.string('processInterval', 255).nullable()
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
  const tableExists = await knex.schema.hasTable(taskServerSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(taskServerSettingPath)
  }
}
