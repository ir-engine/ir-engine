// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const redisSettingPath = 'redis-setting'

export const redisSettingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const redisSettingSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    enabled: Type.Boolean(),
    address: Type.String(),
    port: Type.String(),
    password: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'RedisSetting', additionalProperties: false }
)
export type RedisSettingType = Static<typeof redisSettingSchema>

// Schema for creating new entries
export const redisSettingDataSchema = Type.Pick(redisSettingSchema, ['enabled', 'address', 'port', 'password'], {
  $id: 'RedisSettingData'
})
export type RedisSettingData = Static<typeof redisSettingDataSchema>

// Schema for updating existing entries
export const redisSettingPatchSchema = Type.Partial(redisSettingSchema, {
  $id: 'RedisSettingPatch'
})
export type RedisSettingPatch = Static<typeof redisSettingPatchSchema>

// Schema for allowed query properties
export const redisSettingQueryProperties = Type.Pick(redisSettingSchema, [
  'id',
  'enabled',
  'address',
  'port',
  'password'
])
export const redisSettingQuerySchema = Type.Intersect(
  [
    querySyntax(redisSettingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type RedisSettingQuery = Static<typeof redisSettingQuerySchema>
