import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { StaticResourceTypeInterface } from '@xrengine/common/src/dbmodels/StaticResourceType'

export type StaticResourceTypeDataType = StaticResourceTypeInterface

/**
 * A class for Static Resource Type service
 *
 * @author Vyacheslav Solovjov
 */
export class StaticResourceType<T = StaticResourceTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
