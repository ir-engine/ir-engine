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
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { UserID } from './user.schema'

export const userLoginPath = 'user-login'

export const userLoginMethods = ['get', 'find', 'create', 'patch', 'remove'] as const

// Main data model schema
export const userLoginSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    userAgent: Type.String(),
    ipAddress: Type.Optional(Type.String()),
    port: Type.Optional(Type.Integer()),
    secure: Type.Optional(Type.Boolean()),
    identityProviderId: Type.String({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserLogin', additionalProperties: false }
)
export interface UserLoginType extends Static<typeof userLoginSchema> {}

// Schema for creating new entries
export const userLoginDataSchema = Type.Pick(
  userLoginSchema,
  ['userId', 'userAgent', 'ipAddress', 'port', 'secure', 'identityProviderId'],
  {
    $id: 'UserLoginData'
  }
)
export interface UserLoginData extends Static<typeof userLoginDataSchema> {}

// Schema for updating existing entries
export const userLoginPatchSchema = Type.Partial(userLoginSchema, {
  $id: 'UserLoginPatch'
})
export interface UserLoginPatch extends Static<typeof userLoginPatchSchema> {}

// Schema for allowed query properties
export const userLoginQueryProperties = Type.Pick(userLoginSchema, [
  'id',
  'userId',
  'userAgent',
  'ipAddress',
  'port',
  'secure',
  'identityProviderId'
])
export const userLoginQuerySchema = Type.Intersect(
  [
    querySyntax(userLoginQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserLoginQuery extends Static<typeof userLoginQuerySchema> {}

export const userLoginValidator = /* @__PURE__ */ getValidator(userLoginSchema, dataValidator)
export const userLoginDataValidator = /* @__PURE__ */ getValidator(userLoginDataSchema, dataValidator)
export const userLoginPatchValidator = /* @__PURE__ */ getValidator(userLoginPatchSchema, dataValidator)
export const userLoginQueryValidator = /* @__PURE__ */ getValidator(userLoginQuerySchema, queryValidator)
