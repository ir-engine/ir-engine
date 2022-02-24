import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { PartyUser as PartyUserDataType } from '@xrengine/common/src/interfaces/PartyUser'

import { Application } from '../../../declarations'

/**
 * A class for Party user service
 *
 * @author Vyacheslav Solovjov
 */
export class PartyUser<T = PartyUserDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
