import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { StaticResourceVariantInterface } from '@etherealengine/common/src/dbmodels/StaticResourceVariant'

import { Application } from '../../../declarations'

export type StaticResourceVariantDataType = StaticResourceVariantInterface & {
  staticResourceId: string
}

/**
 * A class for Static Resource Type service
 */
export class StaticResourceVariant<T = StaticResourceVariantDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
