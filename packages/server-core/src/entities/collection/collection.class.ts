import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import createModel from './collection.model'

export class Collection extends Service {
  app: Application
  docs: any
  declare Model: ReturnType<typeof createModel>

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
  /**
   * A method which find collection
   *
   * @param params of query which contains userId
   * @returns {@Object} of collection
   * @author Vyacheslav Solovjov
   */

  async find(params: Params): Promise<any> {
    params.query.$or = [
      {
        userId: params.query.userId
      },
      {
        isPublic: true
      }
    ]
    delete params.query.userId
    return super.find(params)
  }
}
