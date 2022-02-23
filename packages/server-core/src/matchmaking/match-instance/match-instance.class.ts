import { Application } from '../../../declarations'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { MatchInstanceInterface } from '@xrengine/common/src/dbmodels/MatchInstance'

export type MatchInstanceDataType = MatchInstanceInterface

/**
 * A class for OpenMatch Tickets service
 *
 * @author Vyacheslav Solovjov
 */
export class MatchInstance<T = MatchInstanceDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
}
