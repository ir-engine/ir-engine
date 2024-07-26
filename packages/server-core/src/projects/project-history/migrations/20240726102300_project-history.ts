import type { Knex } from 'knex'
import { ActionTypes, projectHistoryPath } from '../project-history.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(projectHistoryPath)
  const actionTypeValues = Object.values(ActionTypes)

  if (tableExists === false) {
    await knex.schema.createTable(projectHistoryPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()

      //@ts-ignore
      table.uuid('projectId', 36).collate('utf8mb4_bin').index()

      //@ts-ignore
      table.uuid('userId', 36).collate('utf8mb4_bin')

      table.enum('action', actionTypeValues).notNullable()

      table.string('actionIdentifier').notNullable()

      table.dateTime('createdAt').notNullable()

      table.foreign('userId').references('id').inTable('user').onDelete('SET NULL').onUpdate('CASCADE')

      table.foreign('projectId').references('id').inTable('project').onDelete('SET NULL').onUpdate('CASCADE')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(projectHistoryPath)

  if (tableExists === true) {
    await knex.schema.dropTable(projectHistoryPath)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
