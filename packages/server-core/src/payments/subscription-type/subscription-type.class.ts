import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '../../../declarations'

/**
 * A class for Subscription Type  service
 *
 * @author Vyacheslav Solovjov
 */
export class SubscriptionType extends Service {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
