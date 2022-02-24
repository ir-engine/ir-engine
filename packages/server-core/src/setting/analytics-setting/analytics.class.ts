import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { SettingAnalytics as SettingAnalyticsInterface } from '@xrengine/common/src/interfaces/SettingAnalytics'

import { Application } from '../../../declarations'

export type SettingAnalyticsDataType = SettingAnalyticsInterface

export class Analytics<T = SettingAnalyticsDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
