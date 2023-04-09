// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { querySyntax, Type } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

export const routePath = 'route'

export const routeMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

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

// Schema for creating new entries
export const routeDataSchema = Type.Pick(routeSchema, ['route', 'project'], {
  $id: 'RouteData'
})
export type RouteData = Static<typeof routeDataSchema>

// Schema for updating existing entries
export const routePatchSchema = Type.Partial(routeSchema, {
  $id: 'RoutePatch'
})
export type RoutePatch = Static<typeof routePatchSchema>

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
