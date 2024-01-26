/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import type { Knex } from 'knex'

import { staticResourcePath } from '@etherealengine/common/src/schemas/media/static-resource.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const thumbnailKeyColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailKey')
  if (!thumbnailKeyColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('thumbnailKey', 255).nullable()
    })
  }

  const customColumnExists = await knex.schema.hasColumn(staticResourcePath, 'hasCustomThumbnail')
  if (!customColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.boolean('hasCustomThumbnail').defaultTo(false)
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  const thumbnailKeyColumnExists = await trx.schema.hasColumn(staticResourcePath, 'thumbnailKey')
  if (thumbnailKeyColumnExists === true) {
    await trx.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('thumbnailKey')
    })
  }

  const customKeyColumnExists = await trx.schema.hasColumn(staticResourcePath, 'hasCustomThumbnail')
  if (customKeyColumnExists === true) {
    await trx.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('hasCustomThumbnail')
    })
  }

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}
