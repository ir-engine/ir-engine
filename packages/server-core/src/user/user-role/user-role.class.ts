import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { UserRoleInterface } from '@xrengine/common/src/dbmodels/UserRole'

export type UserRoleDataType = UserRoleInterface
/**
 * A class for User Role service
 *
 * @author Vyacheslav Solovjov
 */
export class UserRole<T = UserRoleDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
