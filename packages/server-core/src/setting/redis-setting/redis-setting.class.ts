import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { AdminRedisSetting as RedisSettingInterface } from '@xrengine/common/src/interfaces/AdminRedisSetting'

export type RedisSettingDataType = RedisSettingInterface

export class RedisSetting<T = RedisSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
