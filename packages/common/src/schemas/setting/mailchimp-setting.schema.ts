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

import { dataValidator, queryValidator } from '../validators'

export const mailchimpSettingPath = 'mailchimp-setting'

export const mailchimpSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const mailchimpSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    key: Type.String(),
    server: Type.String(),
    audienceId: Type.String(),
    defaultTags: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'MailchimpSetting', additionalProperties: false }
)
export interface MailchimpSettingType extends Static<typeof mailchimpSettingSchema> {}

// Schema for creating new entries
export const mailchimpSettingDataSchema = Type.Pick(
  mailchimpSettingSchema,
  ['key', 'server', 'audienceId', 'defaultTags'],
  {
    $id: 'MailchimpSettingData'
  }
)
export interface MailchimpSettingData extends Static<typeof mailchimpSettingDataSchema> {}

// Schema for updating existing entries
export const mailchimpSettingPatchSchema = Type.Partial(mailchimpSettingSchema, {
  $id: 'MailchimpSettingPatch'
})
export interface MailchimpSettingPatch extends Static<typeof mailchimpSettingPatchSchema> {}

// Schema for allowed query properties
export const mailchimpSettingQueryProperties = Type.Pick(mailchimpSettingSchema, ['server', 'defaultTags'])

export const mailchimpSettingQuerySchema = Type.Intersect(
  [
    querySyntax(mailchimpSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface MailchimpSettingQuery extends Static<typeof mailchimpSettingQuerySchema> {}

export const mailchimpSettingValidator = /* @__PURE__ */ getValidator(mailchimpSettingSchema, dataValidator)
export const mailchimpSettingDataValidator = /* @__PURE__ */ getValidator(mailchimpSettingDataSchema, dataValidator)
export const mailchimpSettingPatchValidator = /* @__PURE__ */ getValidator(mailchimpSettingPatchSchema, dataValidator)
export const mailchimpSettingQueryValidator = /* @__PURE__ */ getValidator(mailchimpSettingQuerySchema, queryValidator)
