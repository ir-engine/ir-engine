import type { Knex } from 'knex'

import { redisSettingPath } from '@etherealengine/engine/src/schemas/setting/redis-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'redisSetting'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, redisSettingPath)
  }

  const tableExists = await knex.schema.hasTable(redisSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(redisSettingPath, (table) => {
      table.string('id', 36).primary()
      table.boolean('enabled').nullable()
      table.string('address', 255).nullable()
      table.string('port', 255).nullable()
      table.string('password', 255).nullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()
    })
  }
}
// test
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(redisSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(redisSettingPath)
  }
}
