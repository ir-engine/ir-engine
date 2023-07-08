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

import { awsSettingPath } from '@etherealengine/engine/src/schemas/setting/aws-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const eksColumnExists = await knex.schema.hasColumn(awsSettingPath, 'eks')
  if (!eksColumnExists) {
    await knex.schema.alterTable(awsSettingPath, async (table) => {
      table.json('eks').nullable()
    })
    await knex.table(awsSettingPath).update({
      eks: JSON.stringify({
        accessKeyId: process.env.EKS_AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.EKS_AWS_SECRET || process.env.AWS_SECRET
      })
    })
  }
  const keysColumnExists = await knex.schema.hasColumn(awsSettingPath, 'keys')
  if (keysColumnExists) {
    const awsSettings = await knex.table(awsSettingPath).first()
    if (!awsSettings) return
    let keys = JSON.parse(awsSettings.keys)
    if (typeof keys === 'string') keys = JSON.parse(keys)
    let s3 = JSON.parse(awsSettings.s3)
    if (typeof s3 === 'string') s3 = JSON.parse(s3)
    s3.accessKeyId = keys.accessKeyId
    s3.secretAccessKey = keys.secretAccessKey
    await knex.table(awsSettingPath).update({
      s3: JSON.stringify(s3)
    })
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const eksColumnExists = await knex.schema.hasColumn(awsSettingPath, 'eks')

  if (eksColumnExists === true) {
    await knex.schema.alterTable(awsSettingPath, async (table) => {
      table.dropColumn('eks')
    })
  }
}
