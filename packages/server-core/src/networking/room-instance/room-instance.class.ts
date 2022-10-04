import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '@xrengine/server-core/declarations'

import { RoomInstanceInterface } from './RoomInstanceInterface'

export class RoomInstance<T = RoomInstanceInterface> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
