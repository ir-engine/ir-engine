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
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'LoginToken', additionalProperties: false }
)
export type LoginTokenType = Static<typeof loginTokenSchema>

// Schema for creating new entries
export const loginTokenDataSchema = Type.Partial(loginTokenSchema, {
  $id: 'LoginTokenData'
})
export type LoginTokenData = Static<typeof loginTokenDataSchema>

// Schema for updating existing entries
export const loginTokenPatchSchema = Type.Partial(loginTokenSchema, {
  $id: 'LoginTokenPatch'
})
export type LoginTokenPatch = Static<typeof loginTokenPatchSchema>

// Schema for allowed query properties
export const loginTokenQueryProperties = Type.Pick(loginTokenSchema, ['id', 'token', 'identityProviderId'])
export const loginTokenQuerySchema = Type.Intersect(
  [
    querySyntax(loginTokenQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type LoginTokenQuery = Static<typeof loginTokenQuerySchema>

export const loginTokenValidator = getValidator(loginTokenSchema, dataValidator)
export const loginTokenDataValidator = getValidator(loginTokenDataSchema, dataValidator)
export const loginTokenPatchValidator = getValidator(loginTokenPatchSchema, dataValidator)
export const loginTokenQueryValidator = getValidator(loginTokenQuerySchema, queryValidator)
