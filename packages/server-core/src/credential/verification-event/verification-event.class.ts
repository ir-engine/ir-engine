import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import moment from 'moment'

import { VerificationEventInterface } from '@xrengine/common/src/dbmodels/VerificationEvent'

import { Application } from '../../../declarations'

export type VerificationEventDataType = VerificationEventInterface & { identityProviderId: string }
/**
 * A class for Verification Event service
 */

export class VerificationEvent<T = VerificationEventDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * Creates a new verification event entry
   *
   * @param data {object}
   * @returns {object}
   */
  async create(data: any): Promise<T> {
    const { userId } = data
    const eventData: any = {
      userId,
      expiresAt: moment().utc().add(2, 'hours').toDate()
    }
    return (await super.create({ ...eventData }, {})) as T
  }
}
