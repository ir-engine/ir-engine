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

import { getValidator, querySyntax, Static, StringEnum, Type } from '@feathersjs/typebox'

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'
import { dataValidator, queryValidator } from '../validators'

import { ABUSE_REASONS } from '../../constants/ModerationConstants'
import { TypedString } from '../../types/TypeboxUtils'
import { LocationID } from '../social/location.schema'
import { UserID } from '../user/user.schema'
import { ModerationID } from './moderation.schema'

export const moderationBanPath = 'moderation-ban'
export const moderationBanMethods = ['create', 'find', 'patch', 'remove'] as const

export type ModerationBanID = OpaqueType<'ModerationBanID'> & string

// Main data model schema
export const moderationBanSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    banUserId: TypedString<UserID>({
      format: 'uuid'
    }),
    reportedLocationId: Type.Optional(
      TypedString<LocationID>({
        format: 'uuid'
      })
    ),
    moderationId: Type.Optional(
      TypedString<ModerationID>({
        format: 'uuid'
      })
    ),
    banReason: StringEnum([...ABUSE_REASONS]),
    ipAddress: Type.Optional(Type.String({ maxLength: 255 })),
    reportedAt: Type.Optional(Type.String({ format: 'date-time' })),
    banned: Type.Boolean(),
    createdBy: TypedString<UserID>({
      format: 'uuid'
    }),
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ModerationBan', additionalProperties: false }
)

export interface ModerationBanType extends Static<typeof moderationBanSchema> {}
// Schema for creating new entries
export const moderationBanDataSchema = Type.Pick(
  moderationBanSchema,
  ['banUserId', 'banReason', 'ipAddress', 'reportedAt', 'banned', 'reportedLocationId', 'moderationId'],
  { $id: 'ModerationBanData' }
)
export interface ModerationBanData extends Static<typeof moderationBanDataSchema> {}

// Schema for updating existing entries
export const moderationBanPatchSchema = Type.Partial(
  Type.Pick(moderationBanSchema, ['banned'], { $id: 'ModerationBanPatch' })
)
export interface ModerationBanPatch extends Static<typeof moderationBanPatchSchema> {}

// Schema for allowed query Properties

const moderationBanQueryProperties = Type.Pick(moderationBanSchema, ['id', 'banUserId', 'banned', 'banReason'])

export const moderationBanQuerySchema = Type.Intersect(
  [
    querySyntax(moderationBanQueryProperties, {
      banUserId: {
        $like: Type.String()
      },
      banReason: {
        $like: Type.String()
      }
    }),
    // Add additional query properties here
    Type.Object(
      {
        action: Type.Optional(Type.String()),
        search: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export interface ModerationBanQuery extends Static<typeof moderationBanQuerySchema> {}

export const moderationBanValidator = /* @__PURE__ */ getValidator(moderationBanSchema, dataValidator)
export const moderationBanDataValidator = /* @__PURE__ */ getValidator(moderationBanDataSchema, dataValidator)
export const moderationBanPatchValidator = /* @__PURE__ */ getValidator(moderationBanPatchSchema, dataValidator)
export const moderationBanQueryValidator = /* @__PURE__ */ getValidator(moderationBanQuerySchema, queryValidator)
