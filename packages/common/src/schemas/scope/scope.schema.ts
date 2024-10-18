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

import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const scopePath = 'scope'

export const scopeMethods = ['create', 'find', 'remove'] as const
export type ScopeType = OpaqueType<'ScopeType'> & string

export type ScopeID = OpaqueType<'ScopeID'> & string

// Main data model schema
export const scopeSchema = Type.Object(
  {
    id: TypedString<ScopeID>({
      format: 'uuid'
    }),
    type: TypedString<ScopeType>(),
    userId: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Scope', additionalProperties: false }
)
export interface ScopeTypeInterface extends Static<typeof scopeSchema> {}

// Schema for creating new entries
export const scopeDataSchema = Type.Pick(scopeSchema, ['type', 'userId'], {
  $id: 'ScopeData'
})
export interface ScopeData extends Static<typeof scopeDataSchema> {}

// Schema for updating existing entries
export const scopePatchSchema = Type.Object(
  {
    scopes: Type.Array(TypedString<ScopeType>()),
    userId: TypedString<UserID>({
      format: 'uuid'
    })
  },
  {
    $id: 'ScopePatch'
  }
)
export interface ScopePatch extends Static<typeof scopePatchSchema> {}

// Schema for allowed query properties
export const scopeQueryProperties = Type.Pick(scopeSchema, ['id', 'type', 'userId'])
export const scopeQuerySchema = Type.Intersect(
  [
    querySyntax(scopeQueryProperties),
    // Add additional query properties here
    Type.Object({ paginate: Type.Optional(Type.Boolean()) }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ScopeQuery extends Static<typeof scopeQuerySchema> {}

export const scopeValidator = /* @__PURE__ */ getValidator(scopeSchema, dataValidator)
export const scopeDataValidator = /* @__PURE__ */ getValidator(scopeDataSchema, dataValidator)
export const scopePatchValidator = /* @__PURE__ */ getValidator(scopePatchSchema, dataValidator)
export const scopeQueryValidator = /* @__PURE__ */ getValidator(scopeQuerySchema, queryValidator)
