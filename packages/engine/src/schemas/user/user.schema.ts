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

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { TypedString } from '../../common/types/TypeboxUtils'
import { instanceAttendanceSchema } from '../networking/instance-attendance.schema'
import { locationAdminSchema } from '../social/location-admin.schema'
import { locationBanSchema } from '../social/location-ban.schema'
import { userSettingSchema } from '../user/user-setting.schema'
import { dataValidator, queryValidator } from '../validators'
import { avatarDataSchema } from './avatar.schema'
import { identityProviderSchema } from './identity-provider.schema'
import { userApiKeySchema } from './user-api-key.schema'

export const userPath = 'user'

export const userMethods = ['get', 'find', 'create', 'patch', 'remove'] as const

export const userScopeSchema = Type.Object(
  {
    type: Type.String()
  },
  { $id: 'UserScope', additionalProperties: false }
)

export type UserID = OpaqueType<'UserID'> & string

// Main data model schema
export const userSchema = Type.Object(
  {
    id: TypedString<UserID>({
      format: 'uuid'
    }),
    name: Type.String(),
    isGuest: Type.Boolean(),
    inviteCode: Type.Optional(Type.String()),
    avatarId: Type.String({
      format: 'uuid'
    }),
    avatar: Type.Ref(avatarDataSchema),
    userSetting: Type.Ref(userSettingSchema),
    apiKey: Type.Ref(userApiKeySchema),
    identityProviders: Type.Array(Type.Ref(identityProviderSchema)),
    locationAdmins: Type.Array(Type.Ref(locationAdminSchema)),
    locationBans: Type.Array(Type.Ref(locationBanSchema)),
    scopes: Type.Array(Type.Ref(userScopeSchema)),
    instanceAttendance: Type.Array(Type.Ref(instanceAttendanceSchema)),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'User', additionalProperties: false }
)
export type UserType = Static<typeof userSchema>

// Schema for creating new entries
export const userDataSchema = Type.Partial(userSchema, {
  $id: 'UserData'
})
export type UserData = Static<typeof userDataSchema>

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch'
})
export type UserPatch = Static<typeof userPatchSchema>

export type UserPublicPatch = Pick<UserType, 'name' | 'avatarId' | 'id'>

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, [
  'id',
  'name',
  'isGuest',
  'inviteCode',
  'avatarId'
  // 'scopes'   Commented out because: https://discord.com/channels/509848480760725514/1093914405546229840/1095101536121667694
])
export const userQuerySchema = Type.Intersect(
  [
    querySyntax(userQueryProperties, {
      id: {
        $like: Type.String()
      },
      name: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        search: Type.Optional(Type.String()),
        skipAvatar: Type.Optional(Type.Boolean())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type UserQuery = Static<typeof userQuerySchema>

export const userScopeValidator = getValidator(userScopeSchema, dataValidator)
export const userValidator = getValidator(userSchema, dataValidator)
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
