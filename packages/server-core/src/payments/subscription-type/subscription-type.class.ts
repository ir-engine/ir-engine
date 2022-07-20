import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { SubscriptionTypeInterface } from '@xrengine/common/src/dbmodels/SubscriptionType'

import { Application } from '../../../declarations'

export type SubscriptionTypeDataType = SubscriptionTypeInterface

/**
 * A class for Subscription Type  service
 */
export class SubscriptionType<T = SubscriptionTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
