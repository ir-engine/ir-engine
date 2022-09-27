import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import moment from 'moment'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import Paginated from '../../types/PageObject'
import makeInitialAdmin from '../../util/make-initial-admin'

interface Data {}

interface ServiceOptions {}
/**
 * A class for Login service
 */
export class Login implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  /**
   * A function which find login details and display it
   *
   * @param params
   * @returns {@Array} all login details
   */
  async find(params?: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  /**
   * A function which find specific login details
   *
   * @param id of specific login detail
   * @param params
   * @returns {@token}
   */
  async get(id: Id, params?: Params): Promise<any> {
    try {
      const result = await this.app.service('login-token').Model.findOne({
        where: {
          token: id
        }
      })
      if (result == null) {
        logger.info('Invalid login token')
        return {
          error: 'invalid login token'
        }
      }
      if (moment().utc().toDate() > result.expiresAt) {
        logger.info('Login Token has expired')
        return { error: 'Login link has expired' }
      }
      const identityProvider = await this.app.service('identity-provider').get(result.identityProviderId)
      await makeInitialAdmin(this.app, identityProvider.userId)
      const apiKey = await this.app.service('user-api-key').find({
        query: {
          userId: identityProvider.userId
        }
      })
      if ((apiKey as any).total === 0)
        await this.app.service('user-api-key').create({
          userId: identityProvider.userId
        })
      const token = await this.app
        .service('authentication')
        .createAccessToken({}, { subject: identityProvider.id.toString() })
      await this.app.service('login-token').remove(result.id)
      await this.app.service('user').patch(identityProvider.userId, {
        isGuest: false
      })
      return {
        token: token
      }
    } catch (err) {
      logger.error(err, `Error finding login token: ${err}`)
      throw err
    }
  }

  /**
   * A function which is used for login
   *
   * @param data of new login details
   * @param params contain user info
   * @returns created data
   */
  async create(data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current, params)))
    }

    return data
  }

  /**
   * A function which is used to update login details
   *
   * @param id of login detail
   * @param data which will be used for updating login
   * @param params
   * @returns updated data
   */
  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  /**
   * A function which is used to update data
   *
   * @param id
   * @param data to be updated
   * @param params
   * @returns data
   */
  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  /**
   * A function which is used to remove login details
   *
   * @param id of login to be removed
   * @param params
   * @returns id
   */

  async remove(id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }
}
