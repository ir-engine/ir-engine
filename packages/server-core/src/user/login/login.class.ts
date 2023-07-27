/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import moment from 'moment'

import { UserApiKeyType, userApiKeyPath } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
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
      const apiKey = (await this.app.service(userApiKeyPath).find({
        query: {
          userId: identityProvider.userId
        }
      })) as Paginated<UserApiKeyType>
      if (apiKey.total === 0)
        await this.app.service(userApiKeyPath).create({
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
