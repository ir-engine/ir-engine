import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { TaskServerSetting as TaskServerSettingInterface } from '@etherealengine/common/src/interfaces/TaskServerSetting'

import { Application } from '../../../declarations'

export type TaskServerSettingDataType = TaskServerSettingInterface

export class TaskServerSetting<T = TaskServerSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
