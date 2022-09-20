import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { ActiveRoutesInterface } from '@xrengine/common/src/interfaces/Route'

import { Application } from '../../../declarations'

interface RouteParams extends Params {
  paginate?: boolean
}

export type ActiveRoutesDataType = ActiveRoutesInterface

export class Route<T = ActiveRoutesDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // @ts-ignore
  async find(params?: RouteParams): Promise<T[], Paginated<T>> {
    if (!params) params = {}
    params.paginate = false
    const routes = await super.find(params as Params)
    return {
      total: (routes as any).length,
      data: routes
    }
  }
}
