import { NullableId, Paginated, Params } from '@feathersjs/feathers'
import { Connect } from 'aws-sdk'
import { BotAction } from 'ee-bot/src/bot/bot-action'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { AdminBot, CreateBotAsAdmin } from '@etherealengine/common/src/interfaces/AdminBot'

import { Application } from '../../../declarations'
import * as botk8s from './bot-helper'

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
    const locationName = result.locationName // showed up in intellisense, lets see, hunting for the function which converts location id to location name
    await botk8s.createBotService()
    await botk8s.createBotPod(result)

    const createBotParams = {
      id: result.id,
      endpoint: `/bots/${result.id}/create`,
      method: 'get',
      json: { name: result.name }
    }
    const connectBotParams = {
      id: result.id,
      endpoint: `/bots/${result.id}/actions/add`,
      method: 'put',
      json: JSON.stringify(BotAction.connect())
    }
    const enterRoomBotParams = {
      id: result.id,
      endpoint: `/bots/${result.id}/actions/add`,
      method: 'post',
      json: JSON.stringify(BotAction.enterRoom('localhost:3000', 'default'))
    }
    const runBotParams = {
      id: result.id,
      endpoint: `/bots/run`,
      method: 'post',
      json: {}
    }
    const response = await botk8s.callBotApi(createBotParams)
    await botk8s.callBotApi(connectBotParams)
    await botk8s.callBotApi(enterRoomBotParams)
    await botk8s.callBotApi(runBotParams) // might use a queue for this or use a action consumer structure, excited :)
    //createBotCommands(this.app, result, data.command!)

    return result
  }

  async patch(id: NullableId, data: any): Promise<AdminBotDataType | AdminBotDataType[]> {
    //logically best suited to hand action additons and bot updates, will check later
    return super.patch(id, data)
  }

  async remove(id: string): Promise<AdminBotDataType | AdminBotDataType[]> {
    //make this remove pod of the bot
    // need to try and find name instead
    const deleteBotParams = {
      id: id,
      endpoint: `/bots/${id}/delete`,
      method: 'delete',
      json: {}
    }
    await botk8s.callBotApi(deleteBotParams)
    await botk8s.deleteBodPod({ id: id })
    return super.remove(id)
  }
}
