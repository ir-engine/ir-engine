import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { ActiveRoutesInterface } from '@xrengine/common/src/interfaces/Route'

import { Application } from '../../../declarations'

export type ActiveRoutesDataType = ActiveRoutesInterface

export class Route<T = ActiveRoutesDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // @ts-ignore
  async find(params?: Params): Promise<T[], Paginated<T>> {
    if (!params) params = {}
    params.paginate = false
    const routes = await super.find(params)
    return {
      total: (routes as any).length,
      data: routes
    }
  }
}
