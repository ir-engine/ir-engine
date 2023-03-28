import type { Params } from '@feathersjs/feathers'
import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterParams } from '@feathersjs/knex'

import type { RouteData, RoutePatch, RouteQuery, RouteType } from './route.schema'

export interface RouteParams extends KnexAdapterParams<RouteQuery> {}

export class RouteService<T = RouteType, ServiceParams extends Params = RouteParams> extends KnexService<
  RouteType,
  RouteData,
  RouteParams,
  RoutePatch
> {}
