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

import { locationPath, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import type { Knex } from 'knex'

const assetPath = 'asset'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  // drop unused columns
  const sidColumnExists = await knex.schema.hasColumn(staticResourcePath, 'sid')
  if (sidColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('sid')
    })
  }
  const urlColumnExists = await knex.schema.hasColumn(staticResourcePath, 'url')
  if (urlColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('url')
    })
  }
  const driverColumnExists = await knex.schema.hasColumn(staticResourcePath, 'driver')
  if (driverColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('driver')
    })
  }
  const metdataColumnExists = await knex.schema.hasColumn(staticResourcePath, 'metadata')
  if (metdataColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('metadata')
    })
  }

  // rename column
  const thumbnailTypeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailType')
  if (thumbnailTypeColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.renameColumn('thumbnailType', 'thumbnailMode')
    })
  }
  const thumbnailURLColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailURL')
  if (thumbnailURLColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.renameColumn('thumbnailURL', 'thumbnailKey')
    })
  }

  // add new columns
  const typeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'type')
  if (!typeColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('type', 255).notNullable().defaultTo('file')
    })
  }
  const dependenciesColumnExists = await knex.schema.hasColumn(staticResourcePath, 'dependencies')
  if (!dependenciesColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.text('dependencies').nullable()
    })
  }
  const descriptionColumnExists = await knex.schema.hasColumn(staticResourcePath, 'description')
  if (!descriptionColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.text('description').nullable()
    })
  }

  /** Change location table from storing sceneId as string to ref the scenetable */
  await knex.schema.alterTable(locationPath, (table) => {
    table.dropForeign('sceneId')
    table.foreign('sceneId').references('id').inTable(staticResourcePath).onDelete('CASCADE').onUpdate('CASCADE')
  })

  await knex.schema.dropTable(assetPath)

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  // add back old columns
  const sidColumnExists = await knex.schema.hasColumn(staticResourcePath, 'sid')
  if (!sidColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('sid', 255).notNullable()
    })
  }
  const urlColumnExists = await knex.schema.hasColumn(staticResourcePath, 'url')
  if (!urlColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('url', 255).defaultTo(null)
    })
  }
  const driverColumnExists = await knex.schema.hasColumn(staticResourcePath, 'driver')
  if (!driverColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('driver', 255).nullable()
    })
  }
  const metdataColumnExists = await knex.schema.hasColumn(staticResourcePath, 'metadata')
  if (!metdataColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.json('metadata').defaultTo(null)
    })
  }

  // rename column
  const thumbnailModeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailMode')
  if (thumbnailModeColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.renameColumn('thumbnailMode', 'thumbnailType')
    })
  }
  const thumbnailKeyColumnExists = await knex.schema.hasColumn(staticResourcePath, 'thumbnailKey')
  if (thumbnailKeyColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.renameColumn('thumbnailKey', 'thumbnailURL')
    })
  }

  // drop new columns
  const typeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'type')
  if (typeColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('type')
    })
  }
  const dependenciesColumnExists = await knex.schema.hasColumn(staticResourcePath, 'dependencies')
  if (dependenciesColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('dependencies')
    })
  }
  const descriptionColumnExists = await knex.schema.hasColumn(staticResourcePath, 'description')
  if (descriptionColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.dropColumn('description')
    })
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
