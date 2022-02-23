import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { ChannelTypeInterface } from '@xrengine/common/src/dbmodels/ChannelType'

export type ChannelTypeDataType = ChannelTypeInterface
/**
 * A class for channel type service
 *
 * @author Vyacheslav Solovjov
 */
export class ChannelType<T = ChannelTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
