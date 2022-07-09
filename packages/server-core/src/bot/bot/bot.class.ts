import { NullableId, Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { AdminBot, CreateBotAsAdmin } from '@xrengine/common/src/interfaces/AdminBot'

import { Application } from '../../../declarations'
import { createBotCommands } from './bot.functions'

export type AdminBotDataType = AdminBot

export class Bot extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<Paginated<AdminBotDataType>> {
    const bots = await this.app.service('bot').Model.findAll({
      include: [
        {
          model: this.app.service('bot-command').Model
        },
        {
          model: this.app.service('location').Model
        },
        {
          model: this.app.service('instance').Model
        }
      ]
    })
    return { data: bots } as Paginated<AdminBotDataType>
  }

  async create(data: CreateBotAsAdmin): Promise<AdminBotDataType> {
    data.instanceId = data.instanceId ? data.instanceId : null
    const result = await super.create(data)
    createBotCommands(this.app, result, data.command!)
    return result
  }

  async patch(id: NullableId, data: any): Promise<AdminBotDataType | AdminBotDataType[]> {
    return super.patch(id, data)
  }
}
