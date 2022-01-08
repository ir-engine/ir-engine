import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '../../../declarations'

/**
 * A class for Email service
 *
 * @author Vyacheslav Solovjov
 */
export class Email extends Service {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
