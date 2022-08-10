import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { InviteType as InviteTypeInterface } from '@xrengine/common/src/interfaces/InviteType'

import { Application } from '../../../declarations'

export type InviteTypeDataType = InviteTypeInterface

/**
 * A class for invite type service
 */
export class InviteType<T = InviteTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
