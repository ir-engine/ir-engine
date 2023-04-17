import { Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { UserKick as UserKickInterface } from '@etherealengine/common/src/interfaces/User'

import { Application } from '../../../declarations'

/**
 * A class for User Kick service
 */
export class UserKick<T = UserKickInterface> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create(data: any, params?: Params) {
    return super.create(data, params)
  }
}
