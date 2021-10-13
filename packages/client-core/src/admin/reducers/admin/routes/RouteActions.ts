import { Route } from '@xrengine/common/src/interfaces/Route'

export const RouteAction = {}

export type RouteActionType = ReturnType<typeof RouteAction[keyof typeof RouteAction]>
