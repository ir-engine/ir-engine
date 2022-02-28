import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { UserSettingsInterface } from '@xrengine/common/src/dbmodels/UserSettings'

import { Application } from '../../../declarations'

export type UserSettingsDataType = UserSettingsInterface
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
}
