import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import Paginated from '../../types/PageObject'
import { Application } from '../../../declarations'
import moment from 'moment'
import logger from '../../logger'

interface Data {}

interface ServiceOptions {}
/**
 * A class for Login service
 *
 * @author Vyacheslav Solovjov
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
   * @author Vyacheslav Solovjov
   */
  async find(params: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  /**
   * A function which find specific login details
   *
   * @param id of specific login detail
   * @param params
   * @returns {@token}
   * @author Vyacheslav Solovjov
   */
  async get(id: Id, params: Params): Promise<any> {
    try {
      const result = await (this.app.service('login-token') as any).Model.findOne({
        where: {
          token: id
        }
      })
      if (result == null) {
        console.log('Invalid login token')
        return {
          error: 'invalid login token'
        }
      }
      if (moment().utc().toDate() > result.expiresAt) {
        console.log('Login Token has expired')
        return { error: 'Login link has expired' }
      }
      const identityProvider = await this.app.service('identity-provider').get(result.identityProviderId)
      const token = await (this.app.service('authentication') as any).createAccessToken(
        {},
        { subject: identityProvider.id.toString() }
      )
      return {
        token: token
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  /**
   * A function which is used for login
   *
   * @param data of new login details
   * @param params contain user info
   * @returns created data
   * @author Vyacheslav Solovjov
   */
  async create(data: Data, params: Params): Promise<Data> {
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
   * @author Vyacheslav Solovjov
   */
  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
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
  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  /**
   * A function which is used to remove login details
   *
   * @param id of login to be removed
   * @param params
   * @returns id
   */

  async remove(id: NullableId, params: Params): Promise<Data> {
    return { id }
  }
}
