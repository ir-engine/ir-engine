// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const matchUserPath = 'match-user'

export const matchUserMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const matchUserSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    ticketId: Type.String({
      format: 'uuid'
    }),
    gameMode: Type.String(),
    connection: Type.String(),
    userId: Type.String({
      format: 'uuid'
    }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'MatchUser', additionalProperties: false }
)
export type MatchUserType = Static<typeof matchUserSchema>

// Schema for creating new entries
export const matchUserDataSchema = Type.Pick(matchUserSchema, ['ticketId', 'gameMode', 'connection'], {
  $id: 'MatchUserData'
})
export type MatchUserData = Static<typeof matchUserDataSchema>

// Schema for updating existing entries
export const matchUserPatchSchema = Type.Partial(matchUserSchema, {
  $id: 'MatchUserPatch'
})
export type MatchUserPatch = Static<typeof matchUserPatchSchema>

// Schema for allowed query properties
export const matchUserQueryProperties = Type.Pick(matchUserSchema, ['id', 'ticketId', 'gameMode', 'connection'])
export const matchUserQuerySchema = Type.Intersect(
  [
    querySyntax(matchUserQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MatchUserQuery = Static<typeof matchUserQuerySchema>
