import type { Knex } from 'knex'

import { serverSettingPath } from '@etherealengine/engine/src/schemas/setting/server-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'serverSetting'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, serverSettingPath)
  }

  const tableExists = await knex.schema.hasTable(serverSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(serverSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('hostname', 255).nullable()
      table.string('mode', 255).nullable()
      table.string('port', 255).nullable()
      table.string('clientHost', 255).nullable()
      table.string('rootDir', 255).nullable()
      table.string('publicDir', 255).nullable()
      table.string('nodeModulesDir', 255).nullable()
      table.string('localStorageProvider', 255).nullable()
      table.boolean('performDryRun').nullable()
      table.string('storageProvider', 255).nullable()
      table.string('gaTrackingId', 255).nullable()
      table.json('hub').nullable()
      table.string('url', 255).nullable()
      table.string('certPath', 255).nullable()
      table.string('keyPath', 255).nullable()
      table.string('gitPem', 2048).nullable()
      table.boolean('local').nullable()
      table.string('releaseName', 255).nullable()
      table.integer('instanceserverUnreachableTimeoutSeconds').defaultTo(2)
      table.string('githubWebhookSecret', 255).nullable()
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
  const tableExists = await knex.schema.hasTable(serverSettingPath)

  if (tableExists === true) {
    await knex.schema.dropTable(serverSettingPath)
  }
}
