import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { UserRoleInterface } from '@xrengine/common/src/dbmodels/UserRole'

import { Application } from '../../../declarations'

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
