/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import type { Knex } from 'knex'

import { clientSettingPath } from '@ir-engine/common/src/schemas/setting/client-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const siteManifest = await knex.schema.hasColumn(clientSettingPath, 'siteManifest')
  if (!siteManifest) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.string('siteManifest', 255).nullable()
    })
  }
  const safariPinnedTab = await knex.schema.hasColumn(clientSettingPath, 'safariPinnedTab')
  if (!safariPinnedTab) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.string('safariPinnedTab', 255).nullable()
    })
  }
  const favicon = await knex.schema.hasColumn(clientSettingPath, 'favicon')
  if (!favicon) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.string('favicon', 255).nullable()
    })
  }
  const clientSetting = await knex.table(clientSettingPath).first()
  if (clientSetting) {
    await knex.table(clientSettingPath).update({
      siteDescription: 'IR Engine',
      appTitle: 'static/ir-logo.svg',
      appSubtitle: 'IR Engine',
      siteManifest: '/site.webmanifest',
      safariPinnedTab: '/safari-pinned-tab.svg',
      favicon: '/favicon.ico'
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const siteManifest = await knex.schema.hasColumn(clientSettingPath, 'siteManifest')
  if (siteManifest) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.dropColumn('siteManifest')
    })
  }
  const safariPinnedTab = await knex.schema.hasColumn(clientSettingPath, 'safariPinnedTab')
  if (safariPinnedTab) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.dropColumn('safariPinnedTab')
    })
  }
  const favicon = await knex.schema.hasColumn(clientSettingPath, 'favicon')
  if (favicon) {
    await knex.schema.alterTable(clientSettingPath, async (table) => {
      table.dropColumn('favicon')
    })
  }
  const clientSetting = await knex.table(clientSettingPath).first()
  if (clientSetting)
    await knex.table(clientSettingPath).update({
      siteDescription: 'Infinite Reality Engine',
      appTitle: 'static/ethereal_watermark_small.png',
      appSubtitle: 'Infinite Reality Engine'
    })
}
