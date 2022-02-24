import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { GroupUserRankInterface } from '@xrengine/common/src/dbmodels/GroupUserRank'

export type GroupUserRankDataType = GroupUserRankInterface
/**
 * A class for GroupUserRank service
 *
 * @author Vyacheslav Solovjov
 */
export class GroupUserRank<T = GroupUserRankDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
