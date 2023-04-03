// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { v4 } from 'uuid'

import type { HookContext } from '@etherealengine/server-core/declarations'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import { getDateTimeSql } from '../../util/get-datetime-sql'

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
export type AnalyticsType = Static<typeof analyticsSchema>

export const analyticsValidator = getValidator(analyticsSchema, dataValidator)
export const analyticsResolver = resolve<AnalyticsType, HookContext>({})

export const analyticsExternalResolver = resolve<AnalyticsType, HookContext>({})

// Schema for creating new entries
export const analyticsDataSchema = Type.Pick(analyticsSchema, ['count', 'type'], {
  $id: 'analyticsData'
})
export type AnalyticsData = Static<typeof analyticsDataSchema>
export const analyticsDataValidator = getValidator(analyticsDataSchema, dataValidator)
export const analyticsDataResolver = resolve<AnalyticsType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

// Schema for updating existing entries
export const analyticsPatchSchema = Type.Partial(analyticsSchema, {
  $id: 'analyticsPatch'
})
export type AnalyticsPatch = Static<typeof analyticsPatchSchema>
export const analyticsPatchValidator = getValidator(analyticsPatchSchema, dataValidator)
export const analyticsPatchResolver = resolve<AnalyticsType, HookContext>({
  updatedAt: getDateTimeSql
})

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
export type AnalyticsQuery = Static<typeof analyticsQuerySchema>
export const analyticsQueryValidator = getValidator(analyticsQuerySchema, queryValidator)
export const analyticsQueryResolver = resolve<AnalyticsQuery, HookContext>({})
