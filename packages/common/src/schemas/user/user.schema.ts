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

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { UserID } from '@ir-engine/hyperflux'
import { USERNAME_MAX_LENGTH } from '../../constants/UserConstants'
import { TypedString } from '../../types/TypeboxUtils'
import { ScopeType } from '../scope/scope.schema'
import { dataValidator, queryValidator } from '../validators'
import { userLoginSchema } from './user-login.schema'

/** @deprecated - import from @ir-engine/hyperflux */
export type { UserID }

export const userPath = 'user'

export const userMethods = ['get', 'find', 'create', 'patch', 'remove'] as const

export const userScopeSchema = Type.Object(
  {
    type: TypedString<ScopeType>()
  },
  { $id: 'UserScope', additionalProperties: false }
)

export type InviteCode = OpaqueType<'InviteCode'> & string
export type UserName = OpaqueType<'UserName'> & string

// Main data model schema
export const userSchema = Type.Object(
  {
    id: TypedString<UserID>({
      format: 'uuid'
    }),
    name: TypedString<UserName>({
      maxLength: USERNAME_MAX_LENGTH
    }),
    acceptedTOS: Type.Boolean(),
    isGuest: Type.Boolean(),
    inviteCode: Type.Optional(TypedString<InviteCode>()),
    lastLogin: Type.Optional(Type.Ref(userLoginSchema)),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'User', additionalProperties: false }
)
export interface UserType extends Static<typeof userSchema> {}

// Schema for creating new entries
export const userDataSchema = Type.Partial(Type.Pick(userSchema, ['name', 'isGuest', 'inviteCode']), {
  $id: 'UserData'
})
export interface UserData extends Static<typeof userDataSchema> {}

// Schema for updating existing entries
export const userPatchSchema = Type.Partial(userSchema, {
  $id: 'UserPatch'
})
export interface UserPatch extends Static<typeof userPatchSchema> {}

export interface UserPublicPatch extends Pick<UserType, 'name' | 'id'> {}

// Schema for allowed query properties
export const userQueryProperties = Type.Pick(userSchema, ['id', 'name', 'isGuest', 'inviteCode', 'createdAt'])
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
export interface UserQuery extends Static<typeof userQuerySchema> {}

export const userScopeValidator = /* @__PURE__ */ getValidator(userScopeSchema, dataValidator)
export const userValidator = /* @__PURE__ */ getValidator(userSchema, dataValidator)
export const userDataValidator = /* @__PURE__ */ getValidator(userDataSchema, dataValidator)
export const userPatchValidator = /* @__PURE__ */ getValidator(userPatchSchema, dataValidator)
export const userQueryValidator = /* @__PURE__ */ getValidator(userQuerySchema, queryValidator)
