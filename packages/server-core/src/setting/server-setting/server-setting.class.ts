import { NullableId, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '../../../declarations'

export class ServerSetting extends Service {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params: Params): Promise<any> {
    const serverSetting = (await super.find()) as any
    const data = serverSetting.data.map((el) => {
      return {
        ...el,
        hub: JSON.parse(JSON.parse(el.hub))
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
