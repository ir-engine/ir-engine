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

import { dataValidator, queryValidator } from '../validators'

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
export interface BuildStatusType extends Static<typeof buildStatusSchema> {}

// Schema for creating new entries
export const buildStatusDataSchema = Type.Pick(
  buildStatusSchema,
  ['status', 'dateStarted', 'dateEnded', 'logs', 'commitSHA'],
  {
    $id: 'BuildStatusData'
  }
)
export interface BuildStatusData extends Static<typeof buildStatusDataSchema> {}

// Schema for updating existing entries
export const buildStatusPatchSchema = Type.Partial(buildStatusSchema, {
  $id: 'BuildStatusPatch'
})
export interface BuildStatusPatch extends Static<typeof buildStatusPatchSchema> {}

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
export interface BuildStatusQuery extends Static<typeof buildStatusQuerySchema> {}

export const buildStatusValidator = /* @__PURE__ */ getValidator(buildStatusSchema, dataValidator)
export const buildStatusDataValidator = /* @__PURE__ */ getValidator(buildStatusDataSchema, dataValidator)
export const buildStatusPatchValidator = /* @__PURE__ */ getValidator(buildStatusPatchSchema, dataValidator)
export const buildStatusQueryValidator = /* @__PURE__ */ getValidator(buildStatusQuerySchema, queryValidator)
