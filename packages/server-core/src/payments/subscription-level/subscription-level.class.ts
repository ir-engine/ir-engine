import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { SubscriptionLevelInterface } from '@xrengine/common/src/dbmodels/SubscriptionLevel'

export type SubscriptionLevelDataType = SubscriptionLevelInterface
/**
 * A class for Subscription Level   service
 *
 * @author Vyacheslav Solovjov
 */
export class SubscriptionLevel<T = SubscriptionLevelDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
