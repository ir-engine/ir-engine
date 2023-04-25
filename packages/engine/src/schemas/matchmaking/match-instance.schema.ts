// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const matchInstancePath = 'match-instance'

export const matchInstanceMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const matchInstanceSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    connection: Type.String(),
    gameMode: Type.Optional(Type.String()),
    instanceServer: Type.Optional(
      Type.String({
        format: 'uuid'
      })
    ),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'MatchInstance', additionalProperties: false }
)
export type MatchInstanceType = Static<typeof matchInstanceSchema>

// Schema for creating new entries
export const matchInstanceDataSchema = Type.Pick(matchInstanceSchema, ['connection', 'gameMode', 'instanceServer'], {
  $id: 'MatchInstanceData'
})
export type MatchInstanceData = Static<typeof matchInstanceDataSchema>

// Schema for updating existing entries
export const matchInstancePatchSchema = Type.Partial(matchInstanceSchema, {
  $id: 'MatchInstancePatch'
})
export type MatchInstancePatch = Static<typeof matchInstancePatchSchema>

// Schema for allowed query properties
export const matchInstanceQueryProperties = Type.Pick(matchInstanceSchema, [
  'id',
  'connection',
  'gameMode',
  'instanceServer'
])
export const matchInstanceQuerySchema = Type.Intersect(
  [
    querySyntax(matchInstanceQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MatchInstanceQuery = Static<typeof matchInstanceQuerySchema>
