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

import { engineSettingPath, EngineSettingType } from '@ir-engine/common/src/schema.type.module'
import { getDataType } from '@ir-engine/common/src/utils/dataTypeUtils'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { flattenObjectToArray } from '@ir-engine/common/src/utils/jsonHelperUtils'
import type { Knex } from 'knex'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  const authenticationSettingPath = 'authentication-setting'

  const isAuthenticationTableExists = await knex.schema.hasTable(authenticationSettingPath)

  if (isAuthenticationTableExists) {
    const authenticationSettingRecord = await knex.table(authenticationSettingPath).first()

    if (authenticationSettingRecord) {
      const flattenedAuthData = flattenObjectToArray({
        service: authenticationSettingRecord.service,
        entity: authenticationSettingRecord.entity,
        jwtOptions: JSON.parse(authenticationSettingRecord.jwtOptions),
        bearerToken: JSON.parse(authenticationSettingRecord.bearerToken),
        authStrategies: JSON.parse(authenticationSettingRecord.authStrategies),
        oauth: JSON.parse(authenticationSettingRecord.oauth),
        jwtPublicKey: authenticationSettingRecord.jwtPublicKey,
        jwtAlgorithm: authenticationSettingRecord.jwtAlgorithm,
        secret: authenticationSettingRecord.secret,
        callback: JSON.parse(authenticationSettingRecord.callback)
      })

      const authenticationSettings: EngineSettingType[] = await Promise.all(
        flattenedAuthData.map(async (authSetting) => ({
          key: authSetting.key,
          value: authSetting.value || '',
          id: uuidv4(),
          dataType: getDataType(`${authSetting.value}`),
          type: (authSetting.key.startsWith('authStrategies.') ? 'public' : 'private') as EngineSettingType['type'],
          category: 'authentication',
          createdAt: await getDateTimeSql(),
          updatedAt: await getDateTimeSql()
        }))
      )

      await knex.from(engineSettingPath).insert([...authenticationSettings])
    }
  }

  await knex.schema.dropTableIfExists(authenticationSettingPath)
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {}
