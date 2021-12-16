import { Params, NullableId } from '@feathersjs/feathers'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { refreshAppConfig } from '../../updateAppConfig'

interface Data {}

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
  async patch(id: NullableId, data: Partial<Data>, params?: Params): Promise<Data> {
    await super.patch(id, data, params)
    //TODO refresh app config
    await refreshAppConfig()
    return data
  }
}
