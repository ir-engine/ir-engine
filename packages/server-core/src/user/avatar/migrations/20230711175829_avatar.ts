import type { Knex } from 'knex'

import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(avatarPath)

  if (tableExists === false) {
    await knex.schema.createTable(avatarPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('name', 255).nullable()
      table.string('identifierName', 255).nullable().unique()
      table.string('modelResourceId', 255).nullable()
      table.string('thumbnailResourceId', 255).nullable()
      table.boolean('isPublic').defaultTo(true)
      //@ts-ignore
      table.uuid('userId').collate('utf8mb4_bin').nullable()
      table.string('project', 255).nullable()
      table.dateTime('createdAt').notNullable()
      table.dateTime('updatedAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(avatarPath)

  if (tableExists === true) {
    await knex.schema.dropTable(avatarPath)
  }
}
