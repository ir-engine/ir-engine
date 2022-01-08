import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '../../../declarations'

/**
 * A class for Seat Status service
 *
 * @author Vyacheslav Solovjov
 */
export class SeatStatus extends Service {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
