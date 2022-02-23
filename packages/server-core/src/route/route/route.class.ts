import { Params, Paginated } from '@feathersjs/feathers'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { ActiveRoutesInterface } from '@xrengine/common/src/interfaces/Route'

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
    const routes = await super.find({ paginate: false })
    return { data: routes }
  }
}
