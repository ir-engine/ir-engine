import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { ChargebeeSetting as ChargebeeSettingDataType } from '@xrengine/common/src/interfaces/ChargebeeSetting'

export class ChargebeeSetting<T = ChargebeeSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
