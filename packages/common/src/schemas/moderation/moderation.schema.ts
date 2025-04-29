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

import { OpaqueType } from '@ir-engine/common/src/interfaces/OpaqueType'

import { LocationID } from '@ir-engine/common/src/schema.type.module'
import { ABUSE_REASONS } from '../../constants/ModerationConstants'
import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const moderationPath = 'moderation'

export const moderationMethods = ['find', 'create', 'patch', 'remove'] as const

export type ModerationID = OpaqueType<'ModerationID'> & string

export type AbuseReasonsType = (typeof ABUSE_REASONS)[number]

const moderationTypes = ['user', 'location'] as const
export type ModerationTypeType = (typeof moderationTypes)[number]

// Main data model schema
export const moderationSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    type: StringEnum([...moderationTypes]),
    abuseReason: StringEnum([...ABUSE_REASONS]),
    reportedUserId: Type.Optional(
      TypedString<UserID>({
        format: 'uuid'
      })
    ),
    reportedLocationId: TypedString<LocationID>({
      format: 'uuid'
    }),
    ipAddress: Type.Optional(Type.String({ maxLength: 255 })),
    reportDetails: Type.String({ maxLength: 1050 }),
    status: StringEnum(['open', 'resolved']),
    reportedAt: Type.String({ format: 'date-time' }),
    createdBy: TypedString<UserID>({
      format: 'uuid'
    }),
    updatedBy: TypedString<UserID>({
      format: 'uuid'
    }),
    referenceNumber: Type.Integer(),
    reportedUserEmail: Type.Optional(Type.String()),
    createdByEmail: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Moderation', additionalProperties: false }
)
export interface ModerationType extends Static<typeof moderationSchema> {}

// Schema for creating new entries
export const moderationDataSchema = Type.Pick(
  moderationSchema,
  ['type', 'reportedUserId', 'reportedLocationId', 'ipAddress', 'abuseReason', 'reportDetails'],
  {
    $id: 'ModerationData'
  }
)
export interface ModerationData extends Static<typeof moderationDataSchema> {}

// Schema for updating existing entries
export const moderationPatchSchema = Type.Partial(
  Type.Pick(moderationSchema, ['status', 'abuseReason', 'reportDetails']),
  {
    $id: 'ModerationPatch'
  }
)
export interface ModerationPatch extends Static<typeof moderationPatchSchema> {}

// Schema for allowed query properties
export const moderationQueryProperties = Type.Pick(moderationSchema, [
  'id',
  'type',
  'referenceNumber',
  'reportedLocationId',
  'reportedUserId',
  'abuseReason',
  'status'
])
export const moderationQuerySchema = Type.Intersect(
  [
    querySyntax(moderationQueryProperties, {
      referenceNumber: {
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
export interface ModerationQuery extends Static<typeof moderationQuerySchema> {}

export const moderationValidator = /* @__PURE__ */ getValidator(moderationSchema, dataValidator)
export const moderationDataValidator = /* @__PURE__ */ getValidator(moderationDataSchema, dataValidator)
export const moderationPatchValidator = /* @__PURE__ */ getValidator(moderationPatchSchema, dataValidator)
export const moderationQueryValidator = /* @__PURE__ */ getValidator(moderationQuerySchema, queryValidator)
