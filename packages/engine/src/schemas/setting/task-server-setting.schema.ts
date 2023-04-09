// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const taskServerSettingPath = 'task-server-setting'

export const taskServerSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const taskServerSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    port: Type.String(),
    processInterval: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'TaskServerSetting', additionalProperties: false }
)
export type TaskServerSettingType = Static<typeof taskServerSettingSchema>

// Schema for creating new entries
export const taskServerSettingDataSchema = Type.Pick(taskServerSettingSchema, ['port', 'processInterval'], {
  $id: 'TaskServerSettingData'
})
export type TaskServerSettingData = Static<typeof taskServerSettingDataSchema>

// Schema for updating existing entries
export const taskServerSettingPatchSchema = Type.Partial(taskServerSettingSchema, {
  $id: 'TaskServerSettingPatch'
})
export type TaskServerSettingPatch = Static<typeof taskServerSettingPatchSchema>

// Schema for allowed query properties
export const taskServerSettingQueryProperties = Type.Pick(taskServerSettingSchema, ['id', 'port', 'processInterval'])
export const taskServerSettingQuerySchema = Type.Intersect(
  [
    querySyntax(taskServerSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type TaskServerSettingQuery = Static<typeof taskServerSettingQuerySchema>
