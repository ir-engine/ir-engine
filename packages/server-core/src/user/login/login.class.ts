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

import { Id, Paginated, ServiceInterface } from '@feathersjs/feathers'

import { identityProviderPath } from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { LoginTokenType, loginTokenPath } from '@etherealengine/engine/src/schemas/user/login-token.schema'
import { UserApiKeyType, userApiKeyPath } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { KnexAdapterParams } from '@feathersjs/knex'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import makeInitialAdmin from '../../util/make-initial-admin'

export interface LoginParams extends KnexAdapterParams {}

/**
 * A class for Login service
 */
export class LoginService implements ServiceInterface {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * A function which find specific login details
   *
   * @param id of specific login detail
   * @param params
   * @returns {@token}
   */
  async get(id: Id, params?: LoginParams) {
    try {
      if (!id) {
        logger.info('Invalid login token id, cannot be null or undefined')
        return {
          error: 'invalid login token id, cannot be null or undefined'
        }
      }
      const result = (await this.app.service(loginTokenPath).find({
        query: {
          token: id.toString()
        }
      })) as Paginated<LoginTokenType>

      if (result.data.length === 0) {
        logger.info('Invalid login token')
        return {
          error: 'invalid login token'
        }
      }
      if (new Date() > new Date(result.data[0].expiresAt)) {
        logger.info('Login Token has expired')
        return { error: 'Login link has expired' }
      }
      const identityProvider = await this.app.service(identityProviderPath).get(result.data[0].identityProviderId)
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
      await this.app.service(loginTokenPath).remove(result.data[0].id)
      await this.app.service(userPath).patch(identityProvider.userId, {
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
}
