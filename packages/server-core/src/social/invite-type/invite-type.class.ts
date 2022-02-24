import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { InviteType as InviteTypeInterface } from '@xrengine/common/src/interfaces/InviteType'

export type InviteTypeDataType = InviteTypeInterface

/**
 * A class for invite type service
 *
 * @author Vyacheslav Solovjov
 */
export class InviteType<T = InviteTypeDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
