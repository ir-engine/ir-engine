import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { GroupUser as GroupUserInterface } from '@xrengine/common/src/interfaces/GroupUser'

export type GroupUserDataType = GroupUserInterface

/**
 * A class for Group user service
 *
 * @author Vyacheslav Solovjov
 */
export class GroupUser<T = GroupUserDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
