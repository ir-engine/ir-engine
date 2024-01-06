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

import { instanceServerSettingPath } from '@etherealengine/common/src/schemas/setting/instance-server-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const oldTableName = 'instanceServerSetting'

  const oldNamedTableExists = await knex.schema.hasTable(oldTableName)
  if (oldNamedTableExists) {
    await knex.schema.renameTable(oldTableName, instanceServerSettingPath)

    const oldRtcStartPortColumnExists = await knex.schema.hasColumn(instanceServerSettingPath, 'rtc_start_port')
    if (oldRtcStartPortColumnExists) {
      await knex.schema.alterTable(instanceServerSettingPath, async (table) => {
        table.renameColumn('rtc_start_port', 'rtcStartPort')
      })
    }

    const oldRtcEndPortColumnExists = await knex.schema.hasColumn(instanceServerSettingPath, 'rtc_end_port')
    if (oldRtcEndPortColumnExists) {
      await knex.schema.alterTable(instanceServerSettingPath, async (table) => {
        table.renameColumn('rtc_end_port', 'rtcEndPort')
      })
    }

    const oldRtcPortBlockSizeColumnExists = await knex.schema.hasColumn(
      instanceServerSettingPath,
      'rtc_port_block_size'
    )
    if (oldRtcPortBlockSizeColumnExists) {
      await knex.schema.alterTable(instanceServerSettingPath, async (table) => {
        table.renameColumn('rtc_port_block_size', 'rtcPortBlockSize')
      })
    }
  }

  const tableExists = await knex.schema.hasTable(instanceServerSettingPath)

  if (tableExists === false) {
    await knex.schema.createTable(instanceServerSettingPath, (table) => {
      //@ts-ignore
      table.uuid('id').collate('utf8mb4_bin').primary()
      table.string('clientHost', 255).nullable()
      table.integer('rtcStartPort').nullable()
      table.integer('rtcEndPort').nullable()
      table.integer('rtcPortBlockSize').nullable()
      table.integer('identifierDigits').nullable()
      table.boolean('local').nullable()
      table.string('domain', 255).nullable()
      table.string('releaseName', 255).nullable()
      table.string('port', 255).nullable()
      table.string('mode', 255).nullable()
      table.string('locationName', 255).nullable()
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
  const trx = await knex.transaction()
  await trx.raw('SET FOREIGN_KEY_CHECKS=0')

  const tableExists = await trx.schema.hasTable(instanceServerSettingPath)

  if (tableExists === true) {
    await trx.schema.dropTable(instanceServerSettingPath)
  }

  await trx.raw('SET FOREIGN_KEY_CHECKS=1')
  await trx.commit()
}
