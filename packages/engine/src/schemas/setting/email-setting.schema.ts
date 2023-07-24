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
import { querySyntax, Type } from '@feathersjs/typebox'

export const emailSettingPath = 'email-setting'

export const emailSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const emailSubjectSchema = Type.Object(
  {
    'new-user': Type.String(),
    location: Type.String(),
    instance: Type.String(),
    login: Type.String(),
    friend: Type.String(),
    group: Type.String(),
    party: Type.String()
  },
  { $id: 'EmailSubject', additionalProperties: false }
)
export type EmailSubjectType = Static<typeof emailSubjectSchema>

export const emailAuthSchema = Type.Object(
  {
    user: Type.String(),
    pass: Type.String()
  },
  { $id: 'EmailAuth', additionalProperties: false }
)
export type EmailAuthType = Static<typeof emailAuthSchema>

export const emailSmtpSchema = Type.Object(
  {
    host: Type.String(),
    port: Type.Number(),
    secure: Type.Boolean(),
    auth: Type.Ref(emailAuthSchema)
  },
  { $id: 'EmailSmtp', additionalProperties: false }
)
export type EmailSmtpType = Static<typeof emailSmtpSchema>

// Main data model schema
export const emailSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    smtp: Type.Ref(emailSmtpSchema),
    from: Type.String(),
    subject: Type.Ref(emailSubjectSchema),
    smsNameCharacterLimit: Type.Number(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'EmailSetting', additionalProperties: false }
)
export type EmailSettingType = Static<typeof emailSettingSchema>

export type EmailSettingDatabaseType = Omit<EmailSettingType, 'smtp' | 'subject'> & { smtp: string; subject: string }

// Schema for creating new entries
export const emailSettingDataSchema = Type.Pick(
  emailSettingSchema,
  ['smtp', 'from', 'subject', 'smsNameCharacterLimit'],
  {
    $id: 'EmailSettingData'
  }
)
export type EmailSettingData = Static<typeof emailSettingDataSchema>

// Schema for updating existing entries
export const emailSettingPatchSchema = Type.Partial(emailSettingSchema, {
  $id: 'EmailSettingPatch'
})
export type EmailSettingPatch = Static<typeof emailSettingPatchSchema>

// Schema for allowed query properties
export const emailSettingQueryProperties = Type.Pick(emailSettingSchema, [
  'id',
  // 'smtp', Commented out because: https://discord.com/channels/509848480760725514/1093914405546229840/1095101536121667694
  'from',
  // 'subject',
  'smsNameCharacterLimit'
])
export const emailSettingQuerySchema = Type.Intersect(
  [
    querySyntax(emailSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type EmailSettingQuery = Static<typeof emailSettingQuerySchema>
