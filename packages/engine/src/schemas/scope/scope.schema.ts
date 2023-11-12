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
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import type { Static } from '@feathersjs/typebox'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { TypedString } from '../../common/types/TypeboxUtils'
import { dataValidator, queryValidator } from '../validators'

export const scopePath = 'scope'

export const scopeMethods = ['create', 'find', 'remove'] as const
export type ScopeType = OpaqueType<'ScopeType'> & string

// Main data model schema
export const scopeSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    type: TypedString<ScopeType>({
      format: 'uuid'
    }),
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
export const scopePatchSchema = Type.Partial(scopeSchema, {
  $id: 'ScopePatch'
})
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

export const scopeValidator = getValidator(scopeSchema, dataValidator)
export const scopeDataValidator = getValidator(scopeDataSchema, dataValidator)
export const scopePatchValidator = getValidator(scopePatchSchema, dataValidator)
export const scopeQueryValidator = getValidator(scopeQuerySchema, queryValidator)
