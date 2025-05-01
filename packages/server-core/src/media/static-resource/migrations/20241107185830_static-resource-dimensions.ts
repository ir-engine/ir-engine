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

import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import type { Knex } from 'knex'

const assetPath = 'asset'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const widthColumnExists = await knex.schema.hasColumn(staticResourcePath, 'width')
  if (!widthColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.float('width').nullable()
    })
  }
  const heightColumnExists = await knex.schema.hasColumn(staticResourcePath, 'height')
  if (!heightColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.float('height').nullable()
    })
  }
  const depthColumnExists = await knex.schema.hasColumn(staticResourcePath, 'depth')
  if (!depthColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.float('depth').nullable()
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const widthColumnExists = await knex.schema.hasColumn(staticResourcePath, 'width')
  if (widthColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('width')
    })
  }
  const heightColumnExists = await knex.schema.hasColumn(staticResourcePath, 'height')
  if (heightColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('height')
    })
  }
  const depthColumnExists = await knex.schema.hasColumn(staticResourcePath, 'depth')
  if (depthColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('depth')
    })
  }
}
