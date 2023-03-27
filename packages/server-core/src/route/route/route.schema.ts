// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { getValidator, querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'
import { v4 } from 'uuid'

import type { HookContext } from '@etherealengine/server-core/declarations'
import { dataValidator, queryValidator } from '@etherealengine/server-core/validators'

import { getDateTimeSql } from '../../util/get-datetime-sql'

// Main data model schema
export const routeSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid'
    }),
    route: Type.String(),
    project: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Route', additionalProperties: false }
)
export type RouteType = Static<typeof routeSchema>

export const routeValidator = getValidator(routeSchema, dataValidator)
export const routeResolver = resolve<RouteType, HookContext>({})

export const routeExternalResolver = resolve<RouteType, HookContext>({})

// Schema for creating new entries
export const routeDataSchema = Type.Pick(routeSchema, ['route', 'project'], {
  $id: 'RouteData'
})
export type RouteData = Static<typeof routeDataSchema>
export const routeDataValidator = getValidator(routeDataSchema, dataValidator)
export const routeDataResolver = resolve<RouteType, HookContext>({
  id: async () => {
    return v4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql
})

// Schema for updating existing entries
export const routePatchSchema = Type.Partial(routeSchema, {
  $id: 'RoutePatch'
})
export type RoutePatch = Static<typeof routePatchSchema>
export const routePatchValidator = getValidator(routePatchSchema, dataValidator)
export const routePatchResolver = resolve<RouteType, HookContext>({
  updatedAt: getDateTimeSql
})

// Schema for allowed query properties
export const routeQueryProperties = Type.Pick(routeSchema, ['id', 'route', 'project'])
export const routeQuerySchema = Type.Intersect(
  [
    querySyntax(routeQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type RouteQuery = Static<typeof routeQuerySchema>
export const routeQueryValidator = getValidator(routeQuerySchema, queryValidator)
export const routeQueryResolver = resolve<RouteQuery, HookContext>({})
