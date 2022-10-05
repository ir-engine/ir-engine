import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { RoomInterface as Room } from '@xrengine/common/src/interfaces/RoomInterface'
import { Application } from '@xrengine/server-core/declarations'

export class RoomInstance<T = Room> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
