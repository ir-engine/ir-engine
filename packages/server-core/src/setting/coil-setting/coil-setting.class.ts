import { Id, Paginated } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { CoilSetting as CoilSettingDataType } from '@xrengine/common/src/interfaces/CoilSetting'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import { UserParams } from '../../user/user/user.class'

export class CoilSetting<T = CoilSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params?: UserParams): Promise<T> {
    const loggedInUser = params!.user as UserInterface
    const settings = (await super.get(id, params)) as any
    if (!loggedInUser.scopes || !loggedInUser.scopes.find((scope) => scope.type === 'admin:admin')) {
      delete settings.clientId
      delete settings.clientSecret
    }
    return settings
  }

  async find(params?: UserParams): Promise<T[] | Paginated<T>> {
    const loggedInUser = params!.user as UserInterface
    const settings = (await super.find(params)) as any
    if (!loggedInUser.scopes || !loggedInUser.scopes.find((scope) => scope.type === 'admin:admin'))
      settings.data.forEach((setting) => {
        delete setting.clientId
        delete setting.clientSecret
      })
    return settings
  }
}
