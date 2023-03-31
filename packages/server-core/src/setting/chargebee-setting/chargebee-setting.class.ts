import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { ChargebeeSetting as ChargebeeSettingDataType } from '@etherealengine/common/src/interfaces/ChargebeeSetting'

import { Application } from '../../../declarations'

export class ChargebeeSetting<T = ChargebeeSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
