// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { v4 } from 'uuid'

import { RouteQuery, RouteType } from '@etherealengine/engine/src/schemas/route/route.schema'
import type { HookContext } from '@etherealengine/server-core/declarations'

import { getDateTimeSql } from '../../util/get-datetime-sql'

export const routeResolver = resolve<RouteType, HookContext>({})

export const routeExternalResolver = resolve<RouteType, HookContext>({})

export const routeDataResolver = resolve<RouteType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

export const routePatchResolver = resolve<RouteType, HookContext>({
  updatedAt: getDateTimeSql
})

export const routeQueryResolver = resolve<RouteQuery, HookContext>({})
