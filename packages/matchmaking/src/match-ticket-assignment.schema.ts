// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const matchTicketAssignmentPath = 'match-ticket-assignment'

export const matchTicketAssignmentMethods = ['get'] as const

// Main data model schema
export const matchTicketAssignmentSchema = Type.Object(
  {
    connection: Type.String(),
    extensions: Type.Optional(
      Type.Record(
        Type.String(),
        Type.Object({
          typeUrl: Type.String(),
          value: Type.String()
        })
      )
    )
  },
  { $id: 'MatchTicketAssignment', additionalProperties: false }
)
export type MatchTicketAssignmentType = Static<typeof matchTicketAssignmentSchema>

// Schema for allowed query properties
export const matchTicketAssignmentQueryProperties = Type.Pick(matchTicketAssignmentSchema, ['connection', 'extensions'])
export const matchTicketAssignmentQuerySchema = Type.Intersect(
  [
    querySyntax(matchTicketAssignmentQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MatchTicketAssignmentQuery = Static<typeof matchTicketAssignmentQuerySchema>
