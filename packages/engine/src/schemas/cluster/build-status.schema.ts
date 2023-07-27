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

export const buildStatusPath = 'build-status'

export const buildStatusMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const buildStatusSchema = Type.Object(
  {
    id: Type.Integer(),
    status: Type.String(),
    dateStarted: Type.String(),
    dateEnded: Type.String(),
    logs: Type.String(),
    commitSHA: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'BuildStatus', additionalProperties: false }
)
export type BuildStatusType = Static<typeof buildStatusSchema>

// Schema for creating new entries
export const buildStatusDataSchema = Type.Pick(
  buildStatusSchema,
  ['status', 'dateStarted', 'dateEnded', 'logs', 'commitSHA'],
  {
    $id: 'BuildStatusData'
  }
)
export type BuildStatusData = Static<typeof buildStatusDataSchema>

// Schema for updating existing entries
export const buildStatusPatchSchema = Type.Partial(buildStatusSchema, {
  $id: 'BuildStatusPatch'
})
export type BuildStatusPatch = Static<typeof buildStatusPatchSchema>

// Schema for allowed query properties
export const buildStatusQueryProperties = Type.Pick(buildStatusSchema, [
  'id',
  'status',
  'dateStarted',
  'dateEnded',
  'logs',
  'commitSHA'
])
export const buildStatusQuerySchema = Type.Intersect(
  [
    querySyntax(buildStatusQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type BuildStatusQuery = Static<typeof buildStatusQuerySchema>
