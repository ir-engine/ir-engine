import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { LocationSettings as LocationSettingsInterface } from '@etherealengine/common/src/interfaces/LocationSettings'

import { Application } from '../../../declarations'

export type LocationSettingsDataType = LocationSettingsInterface
/**
 * A class for Location Setting service
 */
export class LocationSettings<T = LocationSettingsDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
