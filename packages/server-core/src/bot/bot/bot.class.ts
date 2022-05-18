import { NullableId, Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { AdminBot } from '@xrengine/common/src/interfaces/AdminBot'

import { Application } from '../../../declarations'

export type AdminBotDataType = AdminBot

export class Bot<T = AdminBotDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<T[] | Paginated<T>> {
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
    return { data: bots } as Paginated<T>
  }

  async create(data): Promise<T> {
    data.instanceId = data.instanceId ? data.instanceId : null
    return (await super.create(data)) as T
  }

  async patch(id: NullableId, data: any): Promise<T | T[]> {
    return super.patch(id, data)
  }
}
