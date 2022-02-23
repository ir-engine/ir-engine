import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { MessageStatus as MessageStatusDataType } from '@xrengine/common/src/interfaces/MessageStatus'

/**
 * A class for invite type service
 *
 * @author Vyacheslav Solovjov
 */
export class MessageStatus<T = MessageStatusDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
