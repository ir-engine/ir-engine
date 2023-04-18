import type { Knex } from 'knex'

const TABLE_NAME = 'emailSetting'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(TABLE_NAME)

  if (tableExists === false) {
    await knex.schema.createTable(TABLE_NAME, (table) => {
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
  const tableExists = await knex.schema.hasTable(TABLE_NAME)

  if (tableExists === true) {
    await knex.schema.dropTable(TABLE_NAME)
  }
}
