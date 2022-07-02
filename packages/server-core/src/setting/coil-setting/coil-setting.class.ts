import { Id, Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { CoilSetting as CoilSettingDataType } from '@xrengine/common/src/interfaces/CoilSetting'

import { Application } from '../../../declarations'
import { UserDataType } from '../../user/user/user.class'

export class CoilSetting<T = CoilSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params?: Params): Promise<T> {
    const loggedInUser = params!.user as UserDataType
    const settings = (await super.get(id, params)) as any
    if (loggedInUser.userRole !== 'admin') {
      delete settings.clientId
      delete settings.clientSecret
    }
    return settings
  }

  async find(params?: Params): Promise<T[] | Paginated<T>> {
    const loggedInUser = params!.user as UserDataType
    const settings = (await super.find(params)) as any
    if (loggedInUser.userRole !== 'admin')
      settings.data.forEach((setting) => {
        delete setting.clientId
        delete setting.clientSecret
      })
    return settings
  }
}
