import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '../../../declarations'

//import { Params } from '@feathersjs/feathers'

export class InventoryItem extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
  /**
   * A method which find collection
   *
   * @param params of query which contains userId
   * @returns {@Object} of collection
   * @author DRC
   */
  /*
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
  */
}
