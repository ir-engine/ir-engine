import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { MatchUserInterface } from '@xrengine/common/src/dbmodels/MatchUser'

import { Application } from '../../../declarations'

export type MatchUserDataType = MatchUserInterface
/**
 * A class for OpenMatch Tickets service
 */
export class MatchUser<T = MatchUserDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async setup() {}
}
