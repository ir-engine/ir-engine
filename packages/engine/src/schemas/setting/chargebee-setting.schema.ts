// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const chargebeeSettingPath = 'chargebee-setting'

export const chargebeeSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const chargebeeSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    url: Type.String(),
    apiKey: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ChargebeeSetting', additionalProperties: false }
)
export type ChargebeeSettingType = Static<typeof chargebeeSettingSchema>

// Schema for creating new entries
export const chargebeeSettingDataSchema = Type.Pick(chargebeeSettingSchema, ['url', 'apiKey'], {
  $id: 'ChargebeeSettingData'
})
export type ChargebeeSettingData = Static<typeof chargebeeSettingDataSchema>

// Schema for updating existing entries
export const chargebeeSettingPatchSchema = Type.Partial(chargebeeSettingSchema, {
  $id: 'ChargebeeSettingPatch'
})
export type ChargebeeSettingPatch = Static<typeof chargebeeSettingPatchSchema>

// Schema for allowed query properties
export const chargebeeSettingQueryProperties = Type.Pick(chargebeeSettingSchema, ['id', 'url', 'apiKey'])
export const chargebeeSettingQuerySchema = Type.Intersect(
  [
    querySyntax(chargebeeSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type ChargebeeSettingQuery = Static<typeof chargebeeSettingQuerySchema>
