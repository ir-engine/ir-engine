import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { BotCommands as BotCommandInterface } from '@xrengine/common/src/interfaces/AdminBot'

export type BotCommandDataType = BotCommandInterface

export class BotCommand<T = BotCommandDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
