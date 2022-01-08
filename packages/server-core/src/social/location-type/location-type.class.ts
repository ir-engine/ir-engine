import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '../../../declarations'

/**
 * A class for Location Type  service
 *
 * @author Vyacheslav Solovjov
 */
export class LocationType extends Service {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
