import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { GroupUser as GroupUserInterface } from '@xrengine/common/src/interfaces/GroupUser'

import { Application } from '../../../declarations'

export type GroupUserDataType = GroupUserInterface

/**
 * A class for Group user service
 */
export class GroupUser<T = GroupUserDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
