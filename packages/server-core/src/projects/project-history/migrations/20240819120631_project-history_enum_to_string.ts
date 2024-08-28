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

import { projectHistoryPath } from '@ir-engine/common/src/schema.type.module'
import { ActionIdentifierTypes, ActionTypes } from '@ir-engine/common/src/schemas/projects/project-history.schema'
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  /**
   * Migrate `action` type from enum to string
   */
  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.string('actionTemp', 255).notNullable()
  })

  await knex.raw('UPDATE `project-history` SET `actionTemp` = `action`')

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.dropColumn('action')
  })

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.renameColumn('actionTemp', 'action')
  })

  /**
   * Migrate `actionIdentifierType` type from enum to string
   */
  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.string('actionIdentifierTypeTemp', 255).notNullable()
  })

  await knex.raw('UPDATE `project-history` SET `actionIdentifierTypeTemp` = `actionIdentifierType`')

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.dropColumn('actionIdentifierType')
  })

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.renameColumn('actionIdentifierTypeTemp', 'actionIdentifierType')
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  /**
   * Rollback `action` type from string to enum
   */
  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.enum('actionTemp', ActionTypes).notNullable()
  })

  await knex.raw('UPDATE `project-history` SET `actionTemp` = `action`')

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.dropColumn('action')
  })

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.renameColumn('actionTemp', 'action')
  })

  /**
   * Rollback `actionIdentifierType` type from string to enum
   */
  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.enum('actionIdentifierTypeTemp', ActionIdentifierTypes).notNullable()
  })

  await knex.raw('UPDATE `project-history` SET `actionIdentifierTypeTemp` = `actionIdentifierType`')

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.dropColumn('actionIdentifierType')
  })

  await knex.schema.alterTable(projectHistoryPath, async (table) => {
    table.renameColumn('actionIdentifierTypeTemp', 'actionIdentifierType')
  })

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}
