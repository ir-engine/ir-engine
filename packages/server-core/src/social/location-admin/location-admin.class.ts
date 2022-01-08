import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '../../../declarations'

/**
 * A class for Location Admin service
 *
 * @author Vyacheslav Solovjov
 */
export class LocationAdmin extends Service {
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
