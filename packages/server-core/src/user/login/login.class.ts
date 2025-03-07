/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Id, Paginated, ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'

import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { loginTokenPath } from '@ir-engine/common/src/schemas/user/login-token.schema'
import { userApiKeyPath, UserApiKeyType } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { UserID, userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import { userLoginPath } from '@ir-engine/common/src/schemas/user/user-login.schema'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import moment from 'moment'
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
   * A function which validates login information and creates a JWT if valid
   *
   * @param id of specific login detail
   * @param params
   * @returns {token}
   */
  async get(id: Id, params?: LoginParams) {
    try {
      if (!id) {
        logger.info('Invalid login id, cannot be null or undefined')
        return {
          error: 'invalid login id, cannot be null or undefined'
        }
      }
      if (!params?.query?.token) {
        logger.info('Invalid login token, cannot be null or undefined')
        return {
          error: 'invalid login token, cannot be null or undefined'
        }
      }

      let loginToken
      try {
        loginToken = await this.app.service(loginTokenPath).get(id)
      } catch (err) {
        logger.info('Invalid login token ID')
        return {
          error: 'Invalid login token'
        }
      }
      if (loginToken.token !== params?.query?.token) {
        logger.info('Token does not match')
        return {
          error: 'Invalid login token'
        }
      }
      if (new Date() > new Date(loginToken.expiresAt)) {
        logger.info('Login Token has expired')
        await this.app.service(loginTokenPath).remove(loginToken.id)
        return { error: 'Login link has expired' }
      }
      const identityProvider = await this.app.service(identityProviderPath).get(loginToken.identityProviderId)
      let addToLogin = false
      if (loginToken.associateUserId && params!.query?.associate === 'true') {
        await this.app.service(identityProviderPath).patch(identityProvider.id, {
          userId: loginToken.associateUserId
        })
        await this.app.service(userLoginPath).create({
          userId: loginToken.associateUserId as UserID,
          userAgent: params!.headers!['user-agent'],
          identityProviderId: identityProvider.id,
          ipAddress: params!.forwarded?.ip || ''
        })
      }
      if (params!.query?.associate != null) addToLogin = true
      const logins = await this.app.service(userLoginPath).find({
        query: {
          userId: identityProvider.userId
        }
      })
      //Email identity-providers are created as type email, so new vs. existing logins can't be discerned by
      //whether the current identity-provider is a guest. We're using logins === 0 and !addToLogin as a proxy for
      //a brand-new login with that email, which should trigger the auto-association, and that not being true
      //will be seen as an email that is established and shouldn't have the auto-association trigger
      if (identityProvider.type === 'email' && logins.total === 0 && !addToLogin) {
        const existingIdentityProviders = await this.app.service(identityProviderPath).find({
          query: {
            $or: [
              {
                email: identityProvider.token
              },
              {
                token: identityProvider.token
              }
            ],
            id: {
              $ne: identityProvider.id
            }
          }
        })
        if (existingIdentityProviders.total > 0) {
          const loginToken = await this.app.service(loginTokenPath).create({
            identityProviderId: identityProvider.id,
            associateUserId: existingIdentityProviders.data[0].userId,
            expiresAt: toDateTimeSql(moment().utc().add(10, 'minutes').toDate())
          })
          return {
            ...identityProvider,
            associateEmail: identityProvider.token,
            loginId: loginToken.id,
            loginToken: loginToken.token,
            promptForConnection: true
          }
        }
      }
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

      await this.app.service(identityProviderPath).remove(null, {
        query: {
          userId: identityProvider.userId,
          type: 'guest'
        }
      })

      await this.app.service(loginTokenPath).remove(loginToken.id)
      await this.app.service(userPath).patch(identityProvider.userId, {
        isGuest: false
      })

      // Create a user-login record
      await this.app.service(userLoginPath).create({
        userId: identityProvider.userId as UserID,
        userAgent: params?.headers!['user-agent'],
        identityProviderId: identityProvider.id,
        ipAddress: params?.forwarded?.ip || ''
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
