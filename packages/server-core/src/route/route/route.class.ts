import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import { RouteData, RoutePatch, RouteQuery, RouteType } from '@etherealengine/engine/src/schemas/route/route.schema'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RouteParams extends KnexAdapterParams<RouteQuery> {}

export class RouteService<T = RouteType, ServiceParams extends Params = RouteParams> extends KnexService<
  RouteType,
  RouteData,
  RouteParams,
  RoutePatch
> {}
