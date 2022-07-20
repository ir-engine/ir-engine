import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { LocationBan as LocationBanInterface } from '@xrengine/common/src/interfaces/LocationBan'

import { Application } from '../../../declarations'

export type LocationBanDataType = LocationBanInterface

/**
 * A class for Location Ban service
 */
export class LocationBan<T = LocationBanDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
