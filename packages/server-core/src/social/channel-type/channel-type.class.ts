import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { ChannelTypeInterface } from '@xrengine/common/src/dbmodels/ChannelType'

import { Application } from '../../../declarations'

export type ChannelTypeDataType = ChannelTypeInterface
/**
 * A class for channel type service
 */
export class ChannelType<T = ChannelTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
