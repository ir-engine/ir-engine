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
import { v4 as uuidv4 } from 'uuid'

import { userAvatarPath, UserAvatarType } from '@ir-engine/common/src/schemas/user/user-avatar.schema'
import { userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS=0')

  const avatarIdColumnExists = await knex.schema.hasColumn(userPath, 'avatarId')

  if (avatarIdColumnExists === true) {
    const users = await knex.select().from(userPath)

    if (users.length > 0) {
      const userAvatars = await Promise.all(
        users
          .filter((item) => item.avatarId)
          .map(
            async (user) =>
              ({
                id: uuidv4(),
                userId: user.id,
                avatarId: user.avatarId,
                createdAt: await getDateTimeSql(),
                updatedAt: await getDateTimeSql()
              }) as UserAvatarType
          )
      )

      await knex.from(userAvatarPath).insert(userAvatars)
    }
  }

  await knex.raw('SET FOREIGN_KEY_CHECKS=1')
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
