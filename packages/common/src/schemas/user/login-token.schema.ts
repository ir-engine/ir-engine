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
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const loginTokenPath = 'login-token'

export const loginTokenMethods = ['create'] as const

// Main data model schema
export const loginTokenSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    token: Type.String(),
    identityProviderId: Type.String({
      format: 'uuid'
    }),
    expiresAt: Type.String({ format: 'date-time' }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    associateUserId: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    )
  },
  { $id: 'LoginToken', additionalProperties: false }
)
export interface LoginTokenType extends Static<typeof loginTokenSchema> {}

// Schema for creating new entries
export const loginTokenDataSchema = Type.Partial(loginTokenSchema, {
  $id: 'LoginTokenData'
})
export interface LoginTokenData extends Static<typeof loginTokenDataSchema> {}

// Schema for updating existing entries
export const loginTokenPatchSchema = Type.Partial(loginTokenSchema, {
  $id: 'LoginTokenPatch'
})
export interface LoginTokenPatch extends Static<typeof loginTokenPatchSchema> {}

// Schema for allowed query properties
export const loginTokenQueryProperties = Type.Pick(loginTokenSchema, [
  'id',
  'token',
  'identityProviderId',
  'associateUserId'
])
export const loginTokenQuerySchema = Type.Intersect(
  [
    querySyntax(loginTokenQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface LoginTokenQuery extends Static<typeof loginTokenQuerySchema> {}

export const loginTokenValidator = /* @__PURE__ */ getValidator(loginTokenSchema, dataValidator)
export const loginTokenDataValidator = /* @__PURE__ */ getValidator(loginTokenDataSchema, dataValidator)
export const loginTokenPatchValidator = /* @__PURE__ */ getValidator(loginTokenPatchSchema, dataValidator)
export const loginTokenQueryValidator = /* @__PURE__ */ getValidator(loginTokenQuerySchema, queryValidator)
