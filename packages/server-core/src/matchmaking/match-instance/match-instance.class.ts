import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { MatchInstanceInterface } from '@xrengine/common/src/dbmodels/MatchInstance'

import { Application } from '../../../declarations'

export type MatchInstanceDataType = MatchInstanceInterface

/**
 * A class for OpenMatch Tickets service
 */
export class MatchInstance<T = MatchInstanceDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
