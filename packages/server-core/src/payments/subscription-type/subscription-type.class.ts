import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { SubscriptionTypeInterface } from '@xrengine/common/src/dbmodels/SubscriptionType'

export type SubscriptionTypeDataType = SubscriptionTypeInterface

/**
 * A class for Subscription Type  service
 *
 * @author Vyacheslav Solovjov
 */
export class SubscriptionType<T = SubscriptionTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
