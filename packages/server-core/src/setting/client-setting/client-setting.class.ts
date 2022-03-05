import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { ClientSetting as ClientSettingInterface } from '@xrengine/common/src/interfaces/ClientSetting'

import { Application } from '../../../declarations'

export type ClientSettingDataType = ClientSettingInterface

export class ClientSetting<T = ClientSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
