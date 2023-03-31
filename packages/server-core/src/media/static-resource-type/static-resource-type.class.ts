import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { StaticResourceTypeInterface } from '@etherealengine/common/src/dbmodels/StaticResourceType'

import { Application } from '../../../declarations'

export type StaticResourceTypeDataType = StaticResourceTypeInterface

/**
 * A class for Static Resource Type service
 */
export class StaticResourceType<T = StaticResourceTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
