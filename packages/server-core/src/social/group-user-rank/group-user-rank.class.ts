import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { GroupUserRankInterface } from '@xrengine/common/src/dbmodels/GroupUserRank'

import { Application } from '../../../declarations'

export type GroupUserRankDataType = GroupUserRankInterface
/**
 * A class for GroupUserRank service
 */
export class GroupUserRank<T = GroupUserRankDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
