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
          inviteeId: query.userId,
          $limit: query.$limit || 10,
          $skip: query.$skip || 0
        }
      })
    }
    else {
      return super.find({
        query: {
          userId: query.userId,
          $limit: query.$limit || 10,
          $skip: query.$skip || 0
        }
      })
    }
  }
}
