import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { SettingAnalytics as SettingAnalyticsInterface } from '@xrengine/common/src/interfaces/SettingAnalytics'

export type SettingAnalyticsDataType = SettingAnalyticsInterface

export class Analytics<T = SettingAnalyticsDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
