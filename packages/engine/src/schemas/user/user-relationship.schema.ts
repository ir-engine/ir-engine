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
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import type { Static } from '@feathersjs/typebox'
import { querySyntax, StringEnum, Type } from '@feathersjs/typebox'
import { TypedString } from '../../common/types/TypeboxUtils'
import { userRelationshipTypes } from './user-relationship-type.schema'

export const userRelationshipPath = 'user-relationship'

export const userRelationshipMethods = ['find', 'create', 'patch', 'remove'] as const

export type UserRelationshipID = OpaqueType<'RecordingID'> & string

// Main data model schema
export const userRelationshipSchema = Type.Object(
  {
    id: TypedString<UserRelationshipID>({
      format: 'uuid'
    }),
    userId: TypedString<UserId>({
      format: 'uuid'
    }),
    relatedUserId: TypedString<UserId>({
      format: 'uuid'
    }),
    user: Type.Any(), // TODO: Change this to userSchema once its moved to feathers 5.
    relatedUser: Type.Any(), // TODO: Change this to userSchema once its moved to feathers 5.
    userRelationshipType: StringEnum(userRelationshipTypes),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'UserRelationship', additionalProperties: false }
)
export type UserRelationshipType = Static<typeof userRelationshipSchema>

// Schema for creating new entries
export const userRelationshipDataSchema = Type.Pick(
  userRelationshipSchema,
  ['userId', 'relatedUserId', 'userRelationshipType'],
  {
    $id: 'UserRelationshipData'
  }
)
export type UserRelationshipData = Static<typeof userRelationshipDataSchema>

// Schema for updating existing entries
export const userRelationshipPatchSchema = Type.Partial(userRelationshipSchema, {
  $id: 'UserRelationshipPatch'
})
export type UserRelationshipPatch = Static<typeof userRelationshipPatchSchema>

// Schema for allowed query properties
export const userRelationshipQueryProperties = Type.Pick(userRelationshipSchema, [
  'userId',
  'relatedUserId',
  'userRelationshipType'
])
export const userRelationshipQuerySchema = Type.Intersect(
  [
    querySyntax(userRelationshipQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type UserRelationshipQuery = Static<typeof userRelationshipQuerySchema>
