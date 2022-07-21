import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { MessageStatus as MessageStatusDataType } from '@xrengine/common/src/interfaces/MessageStatus'

import { Application } from '../../../declarations'

/**
 * A class for invite type service
 */
export class MessageStatus<T = MessageStatusDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }
}
