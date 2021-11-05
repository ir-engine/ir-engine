import { Params } from '@feathersjs/feathers/lib'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'

export class ServerSetting extends Service {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params: Params): Promise<any> {
    const serverSetting = await super.find()
    const data = (serverSetting as any).data.map((el) => {
      return {
        ...el,
        hub: JSON.parse(JSON.parse(el.hub))
      }
    })

    return {
      total: (serverSetting as any).total,
      limit: (serverSetting as any).limit,
      skip: (serverSetting as any).skip,
      data
    }
  }
}
