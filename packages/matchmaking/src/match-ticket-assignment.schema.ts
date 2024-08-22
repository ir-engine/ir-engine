/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import type { Static } from '@feathersjs/typebox'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '@ir-engine/common/src/schemas/validators'

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
export interface MatchTicketAssignmentType extends Static<typeof matchTicketAssignmentSchema> {}

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
export interface MatchTicketAssignmentQuery extends Static<typeof matchTicketAssignmentQuerySchema> {}

export const matchTicketAssignmentValidator = /* @__PURE__ */ getValidator(matchTicketAssignmentSchema, dataValidator)
export const matchTicketAssignmentQueryValidator = /* @__PURE__ */ getValidator(
  matchTicketAssignmentQuerySchema,
  queryValidator
)
