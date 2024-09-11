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

import { authenticationSettingPath } from '@ir-engine/common/src/schemas/setting/authentication-setting.schema'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const jwtAlgorithmColumnExists = await knex.schema.hasColumn(authenticationSettingPath, 'jwtAlgorithm')
  const jwtPublicKeyColumnExists = await knex.schema.hasColumn(authenticationSettingPath, 'jwtPublicKey')
  if (!jwtPublicKeyColumnExists || !jwtAlgorithmColumnExists)
    await knex.schema.alterTable(authenticationSettingPath, async (table) => {
      if (!jwtAlgorithmColumnExists) table.string('jwtAlgorithm').defaultTo('HS256')
      if (!jwtPublicKeyColumnExists) table.string('jwtPublicKey', 1023).nullable()
    })

  const authSettings = await knex.table(authenticationSettingPath).first()

  if (authSettings && (process.env.JWT_ALGORITHM || process.env.JWT_PUBLIC_KEY)) {
    const data = {} as any
    if (process.env.JWT_ALGORITHM) data.jwtAlgorithm = process.env.JWT_ALGORITHM
    if (process.env.JWT_PUBLIC_KEY) data.jwtPublicKey = process.env.JWT_PUBLIC_KEY
    await knex.table(authenticationSettingPath).update(data)
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(authenticationSettingPath, async (table) => {
    table.dropColumn('jwtAlgorithm')
    table.dropColumn('jwtPublicKey')
  })
}
