import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { BotCommands as BotCommandInterface } from '@xrengine/common/src/interfaces/AdminBot'

import { Application } from '../../../declarations'

export type BotCommandDataType = BotCommandInterface

export class BotCommand<T = BotCommandDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
