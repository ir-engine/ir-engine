import { zendeskSettingPath } from '@etherealengine/common/src/schemas/setting/zendesk-setting.schema'
import { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(zendeskSettingPath)

  if (!tableExists) {
    await knex.schema.createTable(zendeskSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('name', 255).nullable()
      table.string('secret', 255).nullable()
      table.string('kid', 255).nullable()
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
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(zendeskSettingPath)

  if (tableExists) {
    await knex.schema.dropTable(zendeskSettingPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
