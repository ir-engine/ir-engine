import { NullableId, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { UserSetting } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'

export type UserSettingsDataType = UserSetting
/**
 * A class for User Settings service
 *
 * @author Vyacheslav Solovjov
 */
export class UserSettings<T = UserSettingsDataType> extends Service<T> {
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  async create(data: any, params?: Params): Promise<T | T[]> {
    return super.create(data, params)
  }

  async patch(id: NullableId, data: Partial<T>): Promise<T | T[]> {
    return super.patch(id, data)
  }
}
