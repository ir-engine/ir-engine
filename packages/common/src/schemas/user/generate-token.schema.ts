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

export const generateTokenPath = 'generate-token'

export const generateTokenMethods = ['create'] as const

// Main data model schema
export const generateTokenSchema = Type.Object(
  {
    token: Type.String(),
    type: Type.String()
  },
  { $id: 'GenerateToken', additionalProperties: false }
)
export interface GenerateTokenType extends Static<typeof generateTokenSchema> {}

// Schema for creating new entries
export const generateTokenDataSchema = Type.Pick(generateTokenSchema, ['token', 'type'], {
  $id: 'GenerateTokenData'
})
export interface GenerateTokenData extends Static<typeof generateTokenDataSchema> {}

// Schema for updating existing entries
export const generateTokenPatchSchema = Type.Partial(generateTokenSchema, {
  $id: 'GenerateTokenPatch'
})
export interface GenerateTokenPatch extends Static<typeof generateTokenPatchSchema> {}

// Schema for allowed query properties
export const generateTokenQueryProperties = Type.Pick(generateTokenSchema, ['token', 'type'])
export const generateTokenQuerySchema = Type.Intersect(
  [
    querySyntax(generateTokenQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface GenerateTokenQuery extends Static<typeof generateTokenQuerySchema> {}

export const generateTokenValidator = /* @__PURE__ */ getValidator(generateTokenSchema, dataValidator)
export const generateTokenDataValidator = /* @__PURE__ */ getValidator(generateTokenDataSchema, dataValidator)
export const generateTokenPatchValidator = /* @__PURE__ */ getValidator(generateTokenPatchSchema, dataValidator)
export const generateTokenQueryValidator = /* @__PURE__ */ getValidator(generateTokenQuerySchema, queryValidator)
