import { Id, NullableId, Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { UserSetting } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'

export type UserSettingsDataType = UserSetting
/**
 * A class for User Settings service
 */
export class UserSettings<T = UserSettingsDataType> extends Service<T> {
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  async find(params?: Params): Promise<T[] | Paginated<T>> {
    const userSettings = (await super.find(params)) as any
    const data = userSettings.data.map((el) => {
      let themeModes = JSON.parse(el.themeModes)

      if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

      return {
        ...el,
        themeModes: themeModes
      }
    })

    return {
      total: userSettings.total,
      limit: userSettings.limit,
      skip: userSettings.skip,
      data
    }
  }

  async get(id: Id, params?: Params): Promise<T> {
    const userSettings = (await super.get(id, params)) as any
    let themeModes = JSON.parse(userSettings.themeModes)

    if (typeof themeModes === 'string') themeModes = JSON.parse(themeModes)

    return {
      ...userSettings,
      themeModes: themeModes
    }
  }

  async create(data: any, params?: Params): Promise<T | T[]> {
    return super.create(data, params)
  }

  async patch(id: NullableId, data: Partial<T>): Promise<T | T[]> {
    const themeModes = data['themeModes']
    if (themeModes) {
      data['themeModes'] = JSON.stringify(themeModes)
    }

    const result = await super.patch(id, data)

    if (themeModes) {
      result['themeModes'] = themeModes
    }
    return result
  }
}
