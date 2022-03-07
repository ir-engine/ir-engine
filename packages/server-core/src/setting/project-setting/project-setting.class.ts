import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { SettingProject as SettingProjectInterface } from '@xrengine/common/src/interfaces/SettingProject'

import { Application } from '../../../declarations'

export type SettingProjectDataType = SettingProjectInterface

export class ProjectSetting<T = SettingProjectDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<T[] | Paginated<T>> {
    const projectSetting = (await super.find()) as any
    const data = projectSetting.data.map((el) => {
      let settings = JSON.parse(el.settings)

      if (typeof settings === 'string') settings = JSON.parse(settings)

      return {
        ...el,
        settings: settings
      }
    })

    return {
      total: projectSetting.total,
      limit: projectSetting.limit,
      skip: projectSetting.skip,
      data
    }
  }
}
