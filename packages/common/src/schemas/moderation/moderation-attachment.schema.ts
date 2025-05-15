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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import { TypedString } from '../../types/TypeboxUtils'
import { UserID } from '../user/user.schema'
import { dataValidator, queryValidator } from '../validators'

export const moderationAttachmentPath = 'moderation-attachment'
export const moderationAttachmentMethods = ['create', 'find'] as const

// Main data model schema
export const moderationAttachmentsSchema = Type.Object({
  id: Type.String({
    format: 'uuid'
  }),
  moderationId: Type.String({
    format: 'uuid'
  }),
  filePath: Type.String(),
  fileName: Type.String(),
  createdBy: TypedString<UserID>({
    format: 'uuid'
  }),
  updatedBy: TypedString<UserID>({
    format: 'uuid'
  }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})
export interface ModerationAttachmentsType extends Static<typeof moderationAttachmentsSchema> {}

// Schema for creating new entries

export const moderationAttachmentsDataSchema = Type.Pick(
  moderationAttachmentsSchema,
  ['moderationId', 'filePath', 'fileName'],
  {
    $id: 'ModerationAttachmentsData'
  }
)
export interface ModerationAttachmentsData extends Static<typeof moderationAttachmentsDataSchema> {}

// Schema for updating existing entries
export const moderationAttachmentPatchSchema = Type.Partial(moderationAttachmentsSchema)

export interface ModerationAttachmentPatch extends Static<typeof moderationAttachmentPatchSchema> {}

// Schema for allowed query properties
export const moderationAttachmentsQueryProperties = Type.Pick(moderationAttachmentsSchema, ['id', 'moderationId'])

export const moderationAttachmentQuerySchema = Type.Intersect(
  [
    querySyntax(moderationAttachmentsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ModerationAttachmentQuery extends Static<typeof moderationAttachmentQuerySchema> {}

export const moderationAttachmentValidator = /* @__PURE__ */ getValidator(moderationAttachmentsSchema, dataValidator)
export const moderationAttachmentDataValidator = /* @__PURE__ */ getValidator(
  moderationAttachmentsDataSchema,
  dataValidator
)
export const moderationAttachmentPatchValidator = /* @__PURE__ */ getValidator(
  moderationAttachmentPatchSchema,
  dataValidator
)
export const moderationAttachmentQueryValidator = /* @__PURE__ */ getValidator(
  moderationAttachmentQuerySchema,
  queryValidator
)
