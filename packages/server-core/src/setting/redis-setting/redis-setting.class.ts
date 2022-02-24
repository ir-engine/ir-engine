import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { AdminRedisSetting as RedisSettingInterface } from '@xrengine/common/src/interfaces/AdminRedisSetting'

import { Application } from '../../../declarations'

export type RedisSettingDataType = RedisSettingInterface

export class RedisSetting<T = RedisSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
