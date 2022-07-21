import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { SubscriptionLevelInterface } from '@xrengine/common/src/dbmodels/SubscriptionLevel'

import { Application } from '../../../declarations'

export type SubscriptionLevelDataType = SubscriptionLevelInterface
/**
 * A class for Subscription Level   service
 */
export class SubscriptionLevel<T = SubscriptionLevelDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
