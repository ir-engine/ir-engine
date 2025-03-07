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

import { Paginated, Params } from '@feathersjs/feathers'
import { ScopeTypeType, scopeTypePath } from '@ir-engine/common/src/schemas/scope/scope-type.schema'
import { scopePath } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { AvatarType, avatarPath } from '@ir-engine/common/src/schemas/user/avatar.schema'
import { UserApiKeyType, userApiKeyPath } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { InviteCode, UserName, UserType, userPath } from '@ir-engine/common/src/schemas/user/user.schema'
import { Application } from '@ir-engine/server-core/declarations'
import crypto from 'crypto'
import { random } from 'lodash'
import { v1 } from 'uuid'

/**
 * Method to get random avatar id
 * @param app
 * @returns
 */
const getAvatarId = async (app: Application) => {
  const avatars = (await app
    .service(avatarPath)
    .find({ isInternal: true, query: { isPublic: true, $limit: 10 } })) as Paginated<AvatarType>

  return avatars.data[random(avatars.data.length - 1)].id
}

/**
 * Method to get client params with user api key in headers
 * @param app
 * @returns
 */
export const getAuthParams = (userApiKey: UserApiKeyType) => {
  const params = {
    provider: 'rest',
    headers: {
      authorization: `Bearer ${userApiKey.token}`
    }
  } as Params

  return params
}

/**
 * Method to create user api key
 * @param app
 * @param user
 * @returns
 */
export const createUserApiKey = async (app: Application, user: UserType) => {
  const userApiKey = await app.service(userApiKeyPath).create({ userId: user.id })
  return userApiKey
}

/**
 * Method to create user
 * @param app
 * @returns
 */
export const createUser = async (app: Application) => {
  const code = crypto.randomBytes(4).toString('hex') as InviteCode

  const user = await app.service(userPath).create({
    name: `User ${v1()}` as UserName,
    inviteCode: code
  })

  return user
}

export const createAdmin = async (app: Application) => {
  const user = await createUser(app)
  const scopeType = (await app.service(scopeTypePath).find({
    paginate: false
  })) as any as ScopeTypeType[]

  await app.service(scopePath).create(
    scopeType.map((scope) => ({
      type: scope.type,
      userId: user.id
    }))
  )
  return user
}

/**
 * Method used to get user from id
 * @param app
 * @param userId
 * @returns
 */
export const getUser = async (app: Application, userId: string) => {
  const user = await app.service(userPath).get(userId)
  return user
}
