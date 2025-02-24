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

import { Params } from '@feathersjs/feathers'
import { UserApiKeyType } from '@ir-engine/common/src/schema.type.module'
import {
  EngineSettingQuery,
  EngineSettingType,
  engineSettingPath
} from '@ir-engine/common/src/schemas/setting/engine-setting.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'
import { Application } from '@ir-engine/server-core/declarations'
import { createUser, getAuthParams } from './user-test-utils'

/**
 * Helper method used to create engine setting. If params are not provided then it will create random ones.
 * @param app
 * @param key
 * @param value
 * @param type
 * @param category
 * @param user
 * @returns
 */
export const createEngineSetting = async (
  app: Application,
  key: string,
  value: string,
  type: EngineSettingType['type'],
  category: EngineSettingType['category'],
  user?: UserType
) => {
  if (!user) {
    user = await createUser(app)
  }

  const engineSetting = await app.service(engineSettingPath).create(
    {
      key,
      value,
      type,
      category,
      dataType: 'string'
    },
    {
      user
    }
  )

  return { engineSetting, user }
}

/**
 * Helper method used to get engine setting.
 * @param app
 * @param engineSettingId
 * @returns
 */
export const getEngineSetting = async (app: Application, engineSettingId: string) => {
  const engineSetting = await app.service(engineSettingPath).get(engineSettingId)
  return engineSetting
}

/**
 * Helper method used to find engine setting.
 * @param app
 * @param query
 * @param user
 * @returns
 */
export const findEngineSetting = async (app: Application, query: EngineSettingQuery, userApiKey?: UserApiKeyType) => {
  let params: Params = {}

  if (userApiKey) {
    params = getAuthParams(userApiKey)
  }

  const engineSetting = await app.service(engineSettingPath).find({
    query: {
      ...query
    },
    ...params
  })
  return engineSetting
}

/**
 * Helper method used to patch engine setting.
 * @param app
 * @param engineSettingId
 * @param key
 * @param category
 * @returns
 */
export const patchEngineSetting = async (
  app: Application,
  value: string,
  engineSettingId?: string,
  key?: string,
  category?: EngineSettingType['category']
) => {
  const query = {} as EngineSettingQuery

  if (key) {
    query.key = key
  }

  if (category) {
    query.category = category
  }

  const engineSetting = await app.service(engineSettingPath).patch(
    engineSettingId ?? null,
    {
      value
    },
    {
      query
    }
  )

  return engineSetting
}

/**
 * Helper method used to remove engine setting.
 * @param app
 * @param engineSettingId
 * @param engineSetting
 * @returns
 */
export const removeEngineSetting = async (app: Application, engineSettingId?: string, query?: EngineSettingQuery) => {
  const engineSetting = await app.service(engineSettingPath).remove(engineSettingId ?? null, {
    query: {
      ...query
    }
  })
  return engineSetting
}
