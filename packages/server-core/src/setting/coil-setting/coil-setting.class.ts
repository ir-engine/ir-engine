import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { CoilSetting as CoilSettingDataType } from '@xrengine/common/src/interfaces/CoilSetting'

import { Application } from '../../../declarations'

export class CoilSetting<T = CoilSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
