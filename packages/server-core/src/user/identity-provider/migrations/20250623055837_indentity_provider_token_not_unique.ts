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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import type { Knex } from 'knex'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  // Get all indexes on the table to find any unique constraint on token
  const allIndexes = await knex.raw(
    `SHOW INDEX FROM \`${identityProviderPath}\` WHERE Column_name = 'token' AND Non_unique = 0`
  )

  if (allIndexes[0].length > 0) {
    const uniqueKeyNames = [...new Set(allIndexes[0].map((idx) => idx.Key_name))]

    // Drop each unique constraint found
    for (const keyName of uniqueKeyNames) {
      if (typeof keyName != 'string') continue
      try {
        await knex.schema.alterTable(identityProviderPath, (table) => {
          table.dropUnique(['token'], keyName)
        })
        console.log(`Dropped unique constraint: ${keyName}`)
      } catch (error) {
        console.error(`Failed to drop unique constraint: ${keyName}`, error)
      }
    }
  }

  const tokenIndexInfo = await knex.raw(
    `SHOW INDEX FROM \`${identityProviderPath}\` WHERE Column_name = 'token' AND Non_unique = 1`
  )

  if (tokenIndexInfo[0].length === 0) {
    await knex.schema.alterTable(identityProviderPath, (table) => {
      table.index(['token'], 'token_index')
    })
    console.log('Added non-unique index: token_index')
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const indexInfo = await knex.raw(`SHOW INDEX FROM \`${identityProviderPath}\` WHERE Key_name = 'token_index'`)
  if (indexInfo[0].length > 0) {
    // Drop the non-unique index
    await knex.schema.alterTable(identityProviderPath, (table) => {
      table.dropIndex(['token'], 'token_index')
    })
  }

  try {
    await knex.schema.alterTable(identityProviderPath, (table) => {
      table.unique(['token'], { indexName: 'identity_provider_token_unique' })
    })
  } catch (error) {
    console.error('Failed to restore unique constraint on token. There may be duplicate tokens in the database.', error)
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
