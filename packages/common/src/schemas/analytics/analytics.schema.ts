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

export const analyticsPath = 'analytics'

export const analyticsMethods = ['find', 'create'] as const

// Main data model schema
export const analyticsSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    count: Type.Integer(),
    type: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'analytics', additionalProperties: false }
)
export interface AnalyticsType extends Static<typeof analyticsSchema> {}

// Schema for creating new entries
export const analyticsDataSchema = Type.Pick(analyticsSchema, ['count', 'type'], {
  $id: 'analyticsData'
})
export interface AnalyticsData extends Static<typeof analyticsDataSchema> {}

// Schema for updating existing entries
export const analyticsPatchSchema = Type.Partial(analyticsSchema, {
  $id: 'analyticsPatch'
})
export interface AnalyticsPatch extends Static<typeof analyticsPatchSchema> {}

// Schema for allowed query properties
export const analyticsQueryProperties = Type.Pick(analyticsSchema, ['id', 'count', 'type', 'createdAt'])
export const analyticsQuerySchema = Type.Intersect(
  [
    querySyntax(analyticsQueryProperties),
    // Add additional query properties here
    Type.Object({ action: Type.Optional(Type.String()) }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export interface AnalyticsQuery extends Static<typeof analyticsQuerySchema> {}

export const analyticsValidator = /* @__PURE__ */ getValidator(analyticsSchema, dataValidator)
export const analyticsDataValidator = /* @__PURE__ */ getValidator(analyticsDataSchema, dataValidator)
export const analyticsPatchValidator = /* @__PURE__ */ getValidator(analyticsPatchSchema, dataValidator)
export const analyticsQueryValidator = /* @__PURE__ */ getValidator(analyticsQuerySchema, queryValidator)
