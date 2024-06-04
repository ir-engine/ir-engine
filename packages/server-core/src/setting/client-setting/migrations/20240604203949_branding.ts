import type { Knex } from 'knex'

import { clientSettingPath } from '@etherealengine/common/src/schemas/setting/client-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const clientSetting = await knex.table(clientSettingPath).first()
  if (clientSetting) {
    await knex.table(clientSettingPath).update({
      siteDescription: 'IR Engine',
      appTitle: 'static/ir-logo.svg',
      appSubtitle: 'IR Engine'
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const clientSetting = await knex.table(clientSettingPath).first()
  if (clientSetting)
    await knex.table(clientSettingPath).update({
      siteDescription: 'Ethereal Engine',
      appTitle: 'static/ethereal_watermark_small.png',
      appSubtitle: 'Ethereal Engine'
    })
}
