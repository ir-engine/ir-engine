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

import {
  StaticResourceDatabaseType,
  locationPath,
  projectPath,
  staticResourcePath
} from '@etherealengine/common/src/schema.type.module'
import { getDateTimeSql } from '@etherealengine/common/src/utils/datetime-sql'
import type { Knex } from 'knex'
import { getStorageProvider } from '../../storageprovider/storageprovider'
import { createStaticResourceHash } from '../../upload-asset/upload-asset.service'

const assetPath = 'asset'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

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

  // add new columns
  const typeColumnExists = await knex.schema.hasColumn(staticResourcePath, 'type')
  if (!typeColumnExists) {
    await knex.schema.alterTable(staticResourcePath, async (table) => {
      table.string('type', 255).notNullable()
    })
  }
  // TODO auto populate "type" field for all static resources
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

  const tableExists = await trx.schema.hasTable(locationPath)

  const now = await getDateTimeSql()

  if (tableExists) {
    const storageProvider = getStorageProvider()
    const projects = await trx.select().from(projectPath)
    for (const project of projects) {
      const assets = await trx.select().from(assetPath).where({ projectId: project.id })
      const staticResources = [] as StaticResourceDatabaseType[]
      for (const asset of assets) {
        const staticResource = await trx.select().from(staticResourcePath).where({ key: asset.assetURL })
        if (staticResource.length) continue
        staticResources.push({
          id: asset.id,
          key: asset.assetURL,
          mimeType: asset.assetURL.endsWith('.scene.json') ? 'application/json' : 'model/gltf+json',
          userId: null!,
          hash: createStaticResourceHash((await storageProvider.getObject(asset.assetURL)).Body),
          type: 'scene',
          project: project.name,
          tags: null!,
          dependencies: null!,
          attribution: null!,
          licensing: null!,
          description: null!,
          stats: null!,
          thumbnailURL: null!,
          thumbnailMode: null!,
          createdAt: now,
          updatedAt: now
        })
      }
      await trx.from(staticResourcePath).insert(staticResources)
    }
  }

  /** Change location table from storing sceneId as string to ref the scenetable */
  await trx.schema.alterTable(locationPath, (table) => {
    table.dropForeign('sceneId')
    table.foreign('sceneId').references('id').inTable(staticResourcePath).onDelete('CASCADE').onUpdate('CASCADE')
  })

  await trx.schema.dropTable(assetPath)

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

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

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}
