/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { querySyntax, Type } from '@feathersjs/typebox'

import { matchTicketAssignmentSchema } from './match-ticket-assignment.schema'

export const matchTicketPath = 'match-ticket'

export const matchTicketMethods = ['get', 'create', 'remove'] as const

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
    extensions: Type.Optional(
      Type.Record(
        Type.String(),
        Type.Object({
          typeUrl: Type.String(),
          value: Type.String()
        })
      )
    ),
    createdAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
  },
  { $id: 'MatchTicket', additionalProperties: false }
)
export type MatchTicketType = Static<typeof matchTicketSchema>

// Schema for creating new entries
export const matchTicketDataSchema = Type.Object(
  {
    gameMode: Type.String(),
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
  // 'assignment',
  // 'searchFields',
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
