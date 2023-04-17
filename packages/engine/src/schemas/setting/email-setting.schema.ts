// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

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
    port: Type.String(),
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
