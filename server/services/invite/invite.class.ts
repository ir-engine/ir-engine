import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import {
  Params
} from '@feathersjs/feathers'

export class Invite extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<any> {
    const query = params.query
    if (query.type === 'received') {
      return super.find({
        query: {
          inviteeId: query.userId
        }
      })
    }
    else {
      return super.find({
        userId: query.userId
      })
    }
  }
}
