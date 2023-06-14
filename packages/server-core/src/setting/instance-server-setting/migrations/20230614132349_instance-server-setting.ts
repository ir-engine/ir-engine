import type { Knex } from 'knex'

import { instanceServerSettingPath } from '@etherealengine/engine/src/schemas/setting/instance-server-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'instanceServerSetting'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, instanceServerSettingPath)

    const oldRtcStartPortColumnExists = await knex.schema.hasColumn(instanceServerSettingPath, 'rtc_start_port')
    if (oldRtcStartPortColumnExists) {
      await knex.schema.alterTable(instanceServerSettingPath, async (table) => {
        table.renameColumn('rtc_start_port', 'rtcStartPort')
      })
    }

    const oldRtcEndPortColumnExists = await knex.schema.hasColumn(instanceServerSettingPath, 'rtc_end_port')
    if (oldRtcEndPortColumnExists) {
      await knex.schema.alterTable(instanceServerSettingPath, async (table) => {
        table.renameColumn('rtc_end_port', 'rtcEndPort')
      })
    }

    const oldRtcPortBlockSizeColumnExists = await knex.schema.hasColumn(
      instanceServerSettingPath,
      'rtc_port_block_size'
    )
    if (oldRtcPortBlockSizeColumnExists) {
      await knex.schema.alterTable(instanceServerSettingPath, async (table) => {
        table.renameColumn('rtc_port_block_size', 'rtcPortBlockSize')
      })
    }
  }

  const tableExists = await knex.schema.hasTable(instanceServerSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(instanceServerSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('clientHost', 255).nullable()
      table.integer('rtcStartPort').nullable()
      table.integer('rtcEndPort').nullable()
      table.integer('rtcPortBlockSize').nullable()
      table.integer('identifierDigits').nullable()
      table.boolean('local').nullable()
      table.string('domain', 255).nullable()
      table.string('releaseName', 255).nullable()
      table.string('port', 255).nullable()
      table.string('mode', 255).nullable()
      table.string('locationName', 255).nullable()
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
  const tableExists = await knex.schema.hasTable(instanceServerSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(instanceServerSettingPath)
  }
}
