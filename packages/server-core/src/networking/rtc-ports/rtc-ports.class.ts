import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '../../../declarations'

/**
 * A class for Rtc Ports  service
 *
 * @author Vyacheslav Solovjov
 */
export class RtcPorts extends Service {
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
