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

export const userRelationshipTypePath = 'user-relationship-type'

export const userRelationshipTypeMethods = ['find'] as const

export const userRelationshipTypes = [
  'requested', // Default state of relatedUser. Friend request send to another user
  'pending', // Friend request pending by other user
  'friend',
  'blocking', // Blocking another user
  'blocked' // Blocked by other user
]

// Main data model schema
export const userRelationshipTypeSchema = Type.Object(
  {
    type: Type.String()
  },
  { $id: 'UserRelationshipType', additionalProperties: false }
)
export interface UserRelationshipTypeType extends Static<typeof userRelationshipTypeSchema> {}

// Schema for creating new entries
export const userRelationshipTypeDataSchema = Type.Pick(userRelationshipTypeSchema, ['type'], {
  $id: 'UserRelationshipTypeData'
})
export interface UserRelationshipTypeData extends Static<typeof userRelationshipTypeDataSchema> {}

// Schema for updating existing entries
export const userRelationshipTypePatchSchema = Type.Partial(userRelationshipTypeSchema, {
  $id: 'UserRelationshipTypePatch'
})
export interface UserRelationshipTypePatch extends Static<typeof userRelationshipTypePatchSchema> {}

// Schema for allowed query properties
export const userRelationshipTypeQueryProperties = Type.Pick(userRelationshipTypeSchema, ['type'])
export const userRelationshipTypeQuerySchema = Type.Intersect(
  [
    querySyntax(userRelationshipTypeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface UserRelationshipTypeQuery extends Static<typeof userRelationshipTypeQuerySchema> {}

export const userRelationshipTypeValidator = /* @__PURE__ */ getValidator(userRelationshipTypeSchema, dataValidator)
export const userRelationshipTypeDataValidator = /* @__PURE__ */ getValidator(
  userRelationshipTypeDataSchema,
  dataValidator
)
export const userRelationshipTypePatchValidator = /* @__PURE__ */ getValidator(
  userRelationshipTypePatchSchema,
  dataValidator
)
export const userRelationshipTypeQueryValidator = /* @__PURE__ */ getValidator(
  userRelationshipTypeQuerySchema,
  queryValidator
)
