import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { LocationType as LocationTypeInterface } from '@xrengine/common/src/interfaces/LocationType'

import { Application } from '../../../declarations'

export type LocationTypeDataType = LocationTypeInterface

/**
 * A class for Location Type  service
 */
export class LocationType<T = LocationTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
