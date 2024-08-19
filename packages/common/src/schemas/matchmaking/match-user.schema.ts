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
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const matchUserPath = 'match-user'

export const matchUserMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const matchUserSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    ticketId: Type.String({
      format: 'uuid'
    }),
    gameMode: Type.String(),
    connection: Type.String(),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'MatchUser', additionalProperties: false }
)
export interface MatchUserType extends Static<typeof matchUserSchema> {}

// Schema for creating new entries
export const matchUserDataSchema = Type.Pick(matchUserSchema, ['ticketId', 'gameMode', 'userId'], {
  $id: 'MatchUserData'
})
export interface MatchUserData extends Static<typeof matchUserDataSchema> {}

// Schema for updating existing entries
export const matchUserPatchSchema = Type.Partial(matchUserSchema, {
  $id: 'MatchUserPatch'
})
export interface MatchUserPatch extends Static<typeof matchUserPatchSchema> {}

// Schema for allowed query properties
export const matchUserQueryProperties = Type.Pick(matchUserSchema, ['id', 'ticketId', 'gameMode', 'connection'])
export const matchUserQuerySchema = Type.Intersect(
  [
    querySyntax(matchUserQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface MatchUserQuery extends Static<typeof matchUserQuerySchema> {}

export const matchUserValidator = /* @__PURE__ */ getValidator(matchUserSchema, dataValidator)
export const matchUserDataValidator = /* @__PURE__ */ getValidator(matchUserDataSchema, dataValidator)
export const matchUserPatchValidator = /* @__PURE__ */ getValidator(matchUserPatchSchema, dataValidator)
export const matchUserQueryValidator = /* @__PURE__ */ getValidator(matchUserQuerySchema, queryValidator)
