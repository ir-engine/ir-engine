// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const instanceServerSettingPath = 'instance-server-setting'

export const instanceServerSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const instanceServerSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    clientHost: Type.String(),
    rtcStartPort: Type.Integer(),
    rtcEndPort: Type.Integer(),
    rtcPortBlockSize: Type.Integer(),
    identifierDigits: Type.Integer(),
    local: Type.Boolean(),
    domain: Type.String(),
    releaseName: Type.String(),
    port: Type.String(),
    mode: Type.String(),
    locationName: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'InstanceServerSetting', additionalProperties: false }
)
export type InstanceServerSettingType = Static<typeof instanceServerSettingSchema>

// Schema for creating new entries
export const instanceServerSettingDataSchema = Type.Pick(
  instanceServerSettingSchema,
  [
    'clientHost',
    'rtcStartPort',
    'rtcEndPort',
    'rtcPortBlockSize',
    'identifierDigits',
    'local',
    'domain',
    'releaseName',
    'port',
    'mode',
    'locationName'
  ],
  {
    $id: 'InstanceServerSettingData'
  }
)
export type InstanceServerSettingData = Static<typeof instanceServerSettingDataSchema>

// Schema for updating existing entries
export const instanceServerSettingPatchSchema = Type.Partial(instanceServerSettingSchema, {
  $id: 'InstanceServerSettingPatch'
})
export type InstanceServerSettingPatch = Static<typeof instanceServerSettingPatchSchema>

// Schema for allowed query properties
export const instanceServerSettingQueryProperties = Type.Pick(instanceServerSettingSchema, [
  'id',
  'clientHost',
  'rtcStartPort',
  'rtcEndPort',
  'rtcPortBlockSize',
  'identifierDigits',
  'local',
  'domain',
  'releaseName',
  'port',
  'mode',
  'locationName'
])
export const instanceServerSettingQuerySchema = Type.Intersect(
  [
    querySyntax(instanceServerSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type InstanceServerSettingQuery = Static<typeof instanceServerSettingQuerySchema>
