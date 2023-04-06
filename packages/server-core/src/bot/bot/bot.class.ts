import { NullableId, Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import 'ee-bot/bot/bot-manager'
import 'ee-bot/bot/bot-action'

import { Connect } from 'aws-sdk'
import { BotAction } from 'ee-bot/bot/bot-action'
import { BotManager } from 'ee-bot/bot/bot-manager'

import { AdminBot, CreateBotAsAdmin } from '@etherealengine/common/src/interfaces/AdminBot'

import { Application } from '../../../declarations'
import { createBotCommands } from './bot.functions'

export type AdminBotDataType = AdminBot

export class Bot extends Service {
  app: Application
  docs: any
  botmanager: BotManager

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
    this.botmanager = new BotManager({ verbose: true, headless: true })
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
    this.botmanager.addBot(data.name)
    console.log(`added bot ${data.name} to server`)
    this.botmanager.addAction(data.name, BotAction.connect())
    // convert location if to location name
    // domain stays the same 90% of the time
    this.botmanager.addAction(data.name, BotAction.enterRoom('localhost:3000', 'default'))
    await this.botmanager.run()
    //createBotCommands(this.app, result, data.command!)
    return result
  }

  async patch(id: NullableId, data: any): Promise<AdminBotDataType | AdminBotDataType[]> {
    return super.patch(id, data)
  }

  async remove(id: string): Promise<AdminBotDataType | AdminBotDataType[]> {
    // need to try and find name instead
    console.log(`removed all bot from server`)
    this.botmanager.clear()
    return super.remove(id)
  }
}
