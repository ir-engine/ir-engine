// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const coilSettingPath = 'coil-setting'

export const coilSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const coilSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    paymentPointer: Type.String(),
    clientId: Type.String(),
    clientSecret: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'CoilSetting', additionalProperties: false }
)
export type CoilSettingType = Static<typeof coilSettingSchema>

// Schema for creating new entries
export const coilSettingDataSchema = Type.Pick(coilSettingSchema, ['paymentPointer', 'clientId', 'clientSecret'], {
  $id: 'CoilSettingData'
})
export type CoilSettingData = Static<typeof coilSettingDataSchema>

// Schema for updating existing entries
export const coilSettingPatchSchema = Type.Partial(coilSettingSchema, {
  $id: 'CoilSettingPatch'
})
export type CoilSettingPatch = Static<typeof coilSettingPatchSchema>

// Schema for allowed query properties
export const coilSettingQueryProperties = Type.Pick(coilSettingSchema, [
  'id',
  'paymentPointer',
  'clientId',
  'clientSecret'
])
export const coilSettingQuerySchema = Type.Intersect(
  [
    querySyntax(coilSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type CoilSettingQuery = Static<typeof coilSettingQuerySchema>
