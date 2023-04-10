// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { AnalyticsQuery, AnalyticsType } from '@etherealengine/engine/src/schemas/analytics/analytics.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const analyticsResolver = resolve<AnalyticsType, HookContext>({})

export const analyticsExternalResolver = resolve<AnalyticsType, HookContext>({})

export const analyticsDataResolver = resolve<AnalyticsType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const analyticsPatchResolver = resolve<AnalyticsType, HookContext>({
  updatedAt: getDateTimeSql
})

export const analyticsQueryResolver = resolve<AnalyticsQuery, HookContext>({})
