import { NullableId, Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { ServerSetting as ServerSettingInterface } from '@xrengine/common/src/interfaces/ServerSetting'

import { Application } from '../../../declarations'

export type ServerSettingDataType = ServerSettingInterface

export class ServerSetting<T = ServerSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(): Promise<T[] | Paginated<T>> {
    const serverSetting = (await super.find()) as any
    const data = serverSetting.data.map((el) => {
      let hub = JSON.parse(el.hub)

      if (typeof hub === 'string') hub = JSON.parse(hub)

      return {
        ...el,
        hub: hub
      }
    })

    return {
      total: serverSetting.total,
      limit: serverSetting.limit,
      skip: serverSetting.skip,
      data
    }
  }
}
