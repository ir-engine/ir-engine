import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { UserSettingsInterface } from '@xrengine/common/src/dbmodels/UserSettings'

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
