import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { LocationSettings as LocationSettingsInterface } from '@xrengine/common/src/interfaces/LocationSettings'

export type LocationSettingsDataType = LocationSettingsInterface
/**
 * A class for Location Setting service
 *
 * @author Vyacheslav Solovjov
 */
export class LocationSettings<T = LocationSettingsDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
