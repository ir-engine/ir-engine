import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { InstanceServerSetting as InstanceServerSettingInterface } from '@xrengine/common/src/interfaces/InstanceServerSetting'

import { Application } from '../../../declarations'

export type InstanceServerSettingDataType = InstanceServerSettingInterface

export class InstanceServerSetting<T = InstanceServerSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
