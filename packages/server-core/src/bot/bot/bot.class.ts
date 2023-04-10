import { NullableId, Paginated, Params } from '@feathersjs/feathers'
import { Connect } from 'aws-sdk'
import { BotAction } from 'ee-bot/bot/bot-action'
import { BotManager } from 'ee-bot/bot/bot-manager'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { AdminBot, CreateBotAsAdmin } from '@etherealengine/common/src/interfaces/AdminBot'

import { Application } from '../../../declarations'

export type AdminBotDataType = AdminBot

export class Bot extends Service {
  app: Application
  docs: any
  botmanager: BotManager

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
    this.botmanager = new BotManager({ verbose: false, headless: false })
  }

  async find(params?: Params): Promise<Paginated<AdminBotDataType>> {
    const bots = await this.app.service('bot').Model.findAll({
      //let it be database query do not query k8s (for now)
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
    // make it create bot pod with a specific name
    data.instanceId = data.instanceId ? data.instanceId : null
    const result = await super.create(data)
    this.botmanager.addBot(result.id, result.name)
    console.log(`added bot id = ${result.id}and name = ${result.name} to server`)
    this.botmanager.addAction(result.id, BotAction.connect())
    // convert location if to location name
    // domain stays the same 90% of the time
    this.botmanager.addAction(result.id, BotAction.enterRoom('localhost:3000', 'default'))
    await this.botmanager.run()
    //createBotCommands(this.app, result, data.command!)
    console.log(`finished adding bot to server`)
    return result
  }

  async patch(id: NullableId, data: any): Promise<AdminBotDataType | AdminBotDataType[]> {
    // lets see, might need seperate functions to work for this
    return super.patch(id, data)
  }

  async remove(id: string): Promise<AdminBotDataType | AdminBotDataType[]> {
    //make this remove pod of the bot
    // need to try and find name instead
    console.log(`removed bot with id = ${id} from server`)
    this.botmanager.addAction(id, BotAction.disconnect())
    await this.botmanager.run()
    return super.remove(id)
  }
}
