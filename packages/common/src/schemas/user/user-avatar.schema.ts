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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { avatarDataSchema, AvatarID } from './avatar.schema'
import { UserID } from './user.schema'

export const userAvatarPath = 'user-avatar'

export const userAvatarMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const userAvatarSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>(),
    avatarId: TypedString<AvatarID>({
      format: 'uuid'
    }),
    avatar: Type.Ref(avatarDataSchema),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserAvatar', additionalProperties: false }
)
export interface UserAvatarType extends Static<typeof userAvatarSchema> {}

// Schema for creating new entries
export const userAvatarDataSchema = Type.Pick(userAvatarSchema, ['userId', 'avatarId'], {
  $id: 'UserAvatarData'
})
export interface UserAvatarData extends Static<typeof userAvatarDataSchema> {}

// Schema for updating existing entries
export const userAvatarPatchSchema = Type.Partial(userAvatarSchema, {
  $id: 'UserAvatarPatch'
})
export interface UserAvatarPatch extends Static<typeof userAvatarPatchSchema> {}

// Schema for allowed query properties
export const userAvatarQueryProperties = Type.Pick(userAvatarSchema, ['id', 'userId', 'avatarId'])
export const userAvatarQuerySchema = Type.Intersect(
  [
    querySyntax(userAvatarQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserAvatarQuery extends Static<typeof userAvatarQuerySchema> {}

export const userAvatarValidator = /* @__PURE__ */ getValidator(userAvatarSchema, dataValidator)
export const userAvatarDataValidator = /* @__PURE__ */ getValidator(userAvatarDataSchema, dataValidator)
export const userAvatarPatchValidator = /* @__PURE__ */ getValidator(userAvatarPatchSchema, dataValidator)
export const userAvatarQueryValidator = /* @__PURE__ */ getValidator(userAvatarQuerySchema, queryValidator)
