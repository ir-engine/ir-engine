// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { matchTicketAssignmentSchema } from './match-ticket-assignment.schema'

export const matchTicketPath = 'match-ticket'

export const matchTicketMethods = ['get', 'create', 'remove'] as const

export const matchExtensionsSchema = Type.Record(
  Type.String(),
  Type.Object({
    typeUrl: Type.String(),
    value: Type.String()
  }),
  { $id: 'MatchExtensions', additionalProperties: false }
)
export type MatchExtensionsType = Static<typeof matchExtensionsSchema>

export const matchSearchFieldsSchema = Type.Object(
  {
    tags: Type.Array(Type.String()),
    doubleArgs: Type.Optional(Type.Record(Type.String(), Type.Number())),
    stringArgs: Type.Optional(Type.Record(Type.String(), Type.String()))
  },
  { $id: 'MatchSearchFields', additionalProperties: false }
)
export type MatchSearchFieldsType = Static<typeof matchSearchFieldsSchema>

// Main data model schema
export const matchTicketSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    assignment: Type.Optional(Type.Ref(matchTicketAssignmentSchema)),
    searchFields: Type.Optional(Type.Ref(matchSearchFieldsSchema)),
    extensions: Type.Optional(Type.Ref(matchExtensionsSchema)),
    createdAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'MatchTicket', additionalProperties: false }
)
export type MatchTicketType = Static<typeof matchTicketSchema>

// Schema for creating new entries
export const matchTicketDataSchema = Type.Object(
  {
    gamemode: Type.String(),
    attributes: Type.Optional(Type.Record(Type.String(), Type.String()))
  },
  {
    $id: 'MatchTicketData'
  }
)
export type MatchTicketData = Static<typeof matchTicketDataSchema>

// Schema for allowed query properties
export const matchTicketQueryProperties = Type.Pick(matchTicketSchema, [
  'id',
  'assignment',
  'searchFields',
  'extensions'
])
export const matchTicketQuerySchema = Type.Intersect(
  [
    querySyntax(matchTicketQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MatchTicketQuery = Static<typeof matchTicketQuerySchema>
