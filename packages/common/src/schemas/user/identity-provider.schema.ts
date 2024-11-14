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
import { getValidator, querySyntax, StringEnum, Type } from '@feathersjs/typebox'

import { TypedString } from '../../types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'
import { UserID } from './user.schema'

export const identityProviderPath = 'identity-provider'

export const identityProviderMethods = ['find', 'create', 'get', 'patch', 'remove'] as const

export const identityProviderTypes = [
  'email',
  'sms',
  'password',
  'apple',
  'discord',
  'github',
  'google',
  'facebook',
  'twitter',
  'linkedin',
  'auth0',
  'guest'
] as const

// Main data model schema
export const identityProviderSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    token: Type.String(),
    accountIdentifier: Type.Optional(Type.String()),
    oauthToken: Type.Optional(Type.String()),
    oauthRefreshToken: Type.Optional(Type.String()),

    // @ts-ignore
    type: StringEnum(identityProviderTypes),
    userId: TypedString<UserID>(),
    accessToken: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'IdentityProvider', additionalProperties: false }
)
export interface IdentityProviderType extends Static<typeof identityProviderSchema> {}

// Schema for creating new entries
export const identityProviderDataSchema = Type.Pick(
  identityProviderSchema,
  ['token', 'accountIdentifier', 'oauthToken', 'oauthRefreshToken', 'type', 'userId', 'email'],
  {
    $id: 'IdentityProviderData'
  }
)
export interface IdentityProviderData extends Static<typeof identityProviderDataSchema> {}

// Schema for updating existing entries
export const identityProviderPatchSchema = Type.Partial(identityProviderSchema, {
  $id: 'IdentityProviderPatch'
})
export interface IdentityProviderPatch extends Static<typeof identityProviderPatchSchema> {}

// Schema for allowed query properties
export const identityProviderQueryProperties = Type.Pick(identityProviderSchema, [
  'id',
  'token',
  'accountIdentifier',
  'oauthToken',
  'oauthRefreshToken',
  'type',
  'userId',
  'email'
])
export const identityProviderQuerySchema = Type.Intersect(
  [
    querySyntax(identityProviderQueryProperties, {
      accountIdentifier: {
        $like: Type.String()
      },
      email: {
        $like: Type.String(),
        $notlike: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        action: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface IdentityProviderQuery extends Static<typeof identityProviderQuerySchema> {}

export const identityProviderValidator = /* @__PURE__ */ getValidator(identityProviderSchema, dataValidator)
export const identityProviderDataValidator = /* @__PURE__ */ getValidator(identityProviderDataSchema, dataValidator)
export const identityProviderPatchValidator = /* @__PURE__ */ getValidator(identityProviderPatchSchema, dataValidator)
export const identityProviderQueryValidator = /* @__PURE__ */ getValidator(identityProviderQuerySchema, queryValidator)
