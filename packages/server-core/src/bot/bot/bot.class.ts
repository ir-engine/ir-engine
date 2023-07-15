/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { NullableId, Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { AdminBot, CreateBotAsAdmin } from '@etherealengine/common/src/interfaces/AdminBot'
import { botCommandPath } from '@etherealengine/engine/src/schemas/bot/bot-command.schema'

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
    const data: AdminBotDataType[] = []

    const bots = await this.app.service('bot').Model.findAll({
      include: [
        {
          model: this.app.service('location').Model
        },
        {
          model: this.app.service('instance').Model
        }
      ]
    })

    for (const bot of bots) {
      const botCommand = await this.app.service(botCommandPath).find({
        query: {
          botId: bot.id
        }
      })
      data.push({
        ...bot.dataValues,
        botCommands: JSON.parse(JSON.stringify(botCommand.data))
      })
    }

    return { data } as Paginated<AdminBotDataType>
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
