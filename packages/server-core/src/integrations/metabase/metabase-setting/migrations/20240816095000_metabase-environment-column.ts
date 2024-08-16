import { metabaseSettingPath } from '@etherealengine/common/src/schemas/integrations/metabase/metabase-setting.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(metabaseSettingPath)
  if (tableExists) {
    const environmentExists = await knex.schema.hasColumn(metabaseSettingPath, 'environment')
    if (environmentExists === false) {
      await knex.schema.alterTable(metabaseSettingPath, async (table) => {
        table.string('environment').nullable()
      })

      const metabaseSettings = await knex.table(metabaseSettingPath).first()

      if (metabaseSettings) {
        await knex.table(metabaseSettingPath).update({
          environment: process.env.METABASE_ENVIRONMENT
        })
      }
    }
  }
  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await knex.schema.hasTable(metabaseSettingPath)
  if (tableExists) {
    const environmentExists = await knex.schema.hasColumn(metabaseSettingPath, 'environment')
    if (environmentExists) {
      await knex.schema.alterTable(metabaseSettingPath, async (table) => {
        table.dropColumn('environment')
      })
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
