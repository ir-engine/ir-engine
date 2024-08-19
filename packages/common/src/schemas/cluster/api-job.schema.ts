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

export const apiJobPath = 'api-job'

export const apiJobMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

// Main data model schema
export const apiJobSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    name: Type.String(),
    startTime: Type.String({ format: 'date-time' }),
    endTime: Type.String({ format: 'date-time' }),
    status: Type.String(),
    returnData: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'ApiJob', additionalProperties: false }
)
export interface ApiJobType extends Static<typeof apiJobSchema> {}

// Schema for creating new entries
export const apiJobDataSchema = Type.Pick(apiJobSchema, ['name', 'startTime', 'endTime', 'status', 'returnData'], {
  $id: 'ApiJobData'
})
export interface ApiJobData extends Static<typeof apiJobDataSchema> {}

// Schema for updating existing entries
export const apiJobPatchSchema = Type.Partial(apiJobSchema, {
  $id: 'ApiJobPatch'
})
export interface ApiJobPatch extends Static<typeof apiJobPatchSchema> {}

// Schema for allowed query properties
export const apiJobQueryProperties = Type.Pick(apiJobSchema, [
  'id',
  'name',
  'startTime',
  'endTime',
  'status',
  'returnData'
])
export const apiJobQuerySchema = Type.Intersect(
  [
    querySyntax(apiJobQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface ApiJobQuery extends Static<typeof apiJobQuerySchema> {}

export const apiJobValidator = /* @__PURE__ */ getValidator(apiJobSchema, dataValidator)
export const apiJobDataValidator = /* @__PURE__ */ getValidator(apiJobDataSchema, dataValidator)
export const apiJobPatchValidator = /* @__PURE__ */ getValidator(apiJobPatchSchema, dataValidator)
export const apiJobQueryValidator = /* @__PURE__ */ getValidator(apiJobQuerySchema, queryValidator)
