import type { Params } from '@feathersjs/feathers'
import { KnexAdapter } from '@feathersjs/knex'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'

import { Application } from '../../../declarations'
import { UserParams } from '../../user/user/user.class'
import type { RouteData, RoutePatch, RouteQuery, RouteType } from './route.schema'

export interface RouteParams extends KnexAdapterParams<RouteQuery> {}

export class RouteService<T = RouteType, ServiceParams extends Params = RouteParams> extends KnexAdapter<
  RouteType,
  RouteData,
  RouteParams,
  RoutePatch
> {
  app: Application
  docs: any

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: UserParams) {
    if (!params) params = {}
    params.paginate = false
    const routes = await super._find(params)
    return {
      total: (routes as any).length,
      data: routes
    }
  }
}
