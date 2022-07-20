import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { LocationAdmin as LocationAdminInterface } from '@xrengine/common/src/interfaces/LocationAdmin'

import { Application } from '../../../declarations'

export type LocationAdminDataType = LocationAdminInterface
/**
 * A class for Location Admin service
 */
export class LocationAdmin<T = LocationAdminDataType> extends Service<T> {
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
