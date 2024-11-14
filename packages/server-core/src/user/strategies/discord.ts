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

import { AuthenticationRequest, AuthenticationResult } from '@feathersjs/authentication'
import { Paginated, Params } from '@feathersjs/feathers'

import { identityProviderPath } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { userApiKeyPath, UserApiKeyType } from '@ir-engine/common/src/schemas/user/user-api-key.schema'
import { InviteCode, UserName, userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import { loginTokenPath } from '@ir-engine/common/src/schemas/user/login-token.schema'
import { toDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import moment from 'moment/moment'
import { Application } from '../../../declarations'
import config from '../../appconfig'
import { RedirectConfig } from '../../types/OauthStrategies'
import getFreeInviteCode from '../../util/get-free-invite-code'
import makeInitialAdmin from '../../util/make-initial-admin'
import CustomOAuthStrategy, { CustomOAuthParams } from './custom-oauth'

export class DiscordStrategy extends CustomOAuthStrategy {
  constructor(app: Application) {
    super()
    this.app = app
  }

  async getEntityData(profile: any, entity: any, params: Params): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {})
    const authResult = entity
      ? entity
      : await (this.app.service('authentication') as any).strategies.jwt.authenticate(
          { accessToken: params?.authentication?.accessToken },
          {}
        )
    const identityProvider = authResult[identityProviderPath] ? authResult[identityProviderPath] : authResult
    const userId = identityProvider ? identityProvider.userId : params?.query ? params.query.userId : undefined

    console.log('discord profile', profile)
    const returned = {
      ...baseData,
      accountIdentifier: `${profile.username}#${profile.discriminator}`,
      type: 'discord',
      userId
    }
    if (profile.email) returned.email = profile.email
    return returned
  }

  async updateEntity(entity: any, profile: any, params: Params): Promise<any> {
    const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: params?.authentication?.accessToken },
      {}
    )
    if (entity.type === 'discord') {
      if (!entity.userId) {
        const code = (await getFreeInviteCode(this.app)) as InviteCode
        const newUser = await this.app.service(userPath).create({
          name: '' as UserName,
          isGuest: false,
          inviteCode: code
        })
        entity.userId = newUser.id
        await this.app.service(identityProviderPath).patch(entity.id, {
          userId: newUser.id,
          email: entity.email
        })
      } else
        await this.app.service(identityProviderPath)._patch(entity.id, {
          email: entity.email
        })
    }
    const identityProvider = authResult[identityProviderPath]
    const user = await this.app.service(userPath).get(entity.userId)
    await makeInitialAdmin(this.app, user.id)
    if (user.isGuest)
      await this.app.service(userPath).patch(entity.userId, {
        isGuest: false
      })
    const apiKey = (await this.app.service(userApiKeyPath).find({
      query: {
        userId: entity.userId
      }
    })) as Paginated<UserApiKeyType>
    if (apiKey.total === 0)
      await this.app.service(userApiKeyPath).create({
        userId: entity.userId
      })
    if (entity.type !== 'guest' && identityProvider.type === 'guest') {
      await this.app.service(identityProviderPath).remove(identityProvider.id)
      await this.app.service(userPath).remove(identityProvider.userId)
      await this.userLoginEntry(entity, params)
      return super.updateEntity(entity, profile, params)
    }
    const existingEntity = await super.findEntity(profile, params)
    if (!existingEntity) {
      profile.userId = user.id
      const newIP = await super.createEntity(profile, params)
      if (entity.type === 'guest') {
        if (profile.email) {
          const profileEmail = profile.email
          const existingIdentityProviders = await this.app.service(identityProviderPath).find({
            query: {
              $or: [
                {
                  email: profileEmail
                },
                {
                  token: profileEmail
                }
              ],
              id: {
                $ne: newIP.id
              }
            }
          })
          if (existingIdentityProviders.total > 0) {
            const loginToken = await this.app.service(loginTokenPath).create({
              identityProviderId: newIP.id,
              associateUserId: existingIdentityProviders.data[0].userId,
              expiresAt: toDateTimeSql(moment().utc().add(10, 'minutes').toDate())
            })
            return {
              ...entity,
              associateEmail: profileEmail,
              loginId: loginToken.id,
              loginToken: loginToken.token,
              promptForConnection: true
            }
          }
        }
        await this.app.service(identityProviderPath).remove(entity.id)
      }
      await this.userLoginEntry(newIP, params)
      return newIP
    } else if (existingEntity.userId === identityProvider.userId) {
      await this.userLoginEntry(existingEntity, params)
      return existingEntity
    } else {
      throw new Error('Another user is linked to this account')
    }
  }

  async getRedirect(data: AuthenticationResult | Error, params: CustomOAuthParams): Promise<string> {
    let redirectConfig: RedirectConfig
    try {
      redirectConfig = JSON.parse(params.redirect!)
    } catch {
      redirectConfig = {}
    }
    let { domain: redirectDomain, path: redirectPath, instanceId: redirectInstanceId } = redirectConfig
    redirectDomain = redirectDomain ? `${redirectDomain}/auth/oauth/discord` : config.authentication.callback.discord

    if (data instanceof Error || Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string
      return redirectDomain + `?error=${err}`
    }

    if (data[identityProviderPath]?.promptForConnection) {
      let redirectUrl = `${redirectDomain}?promptForConnection=true&associateEmail=${data[identityProviderPath].associateEmail}&loginToken=${data[identityProviderPath].loginToken}&loginId=${data[identityProviderPath].loginId}`
      if (redirectPath) {
        redirectUrl = redirectUrl.concat(`&path=${redirectPath}`)
      }
      if (redirectInstanceId) {
        redirectUrl = redirectUrl.concat(`&instanceId=${redirectInstanceId}`)
      }

      return redirectUrl
    } else {
      const loginType = params.query?.userId ? 'connection' : 'login'
      let redirectUrl = `${redirectDomain}?token=${data.accessToken}&type=${loginType}`
      if (redirectPath) {
        redirectUrl = redirectUrl.concat(`&path=${redirectPath}`)
      }
      if (redirectInstanceId) {
        redirectUrl = redirectUrl.concat(`&instanceId=${redirectInstanceId}`)
      }

      return redirectUrl
    }
  }

  async authenticate(authentication: AuthenticationRequest, originalParams: Params) {
    if (authentication.error) {
      if (authentication.error === 'access_denied') throw new Error('You canceled the Discord OAuth login flow')
      else
        throw new Error(
          'There was a problem with the Discord OAuth login flow: ' + authentication.error_description ||
            authentication.error
        )
    }
    const entity: string = this.configuration.entity
    const { provider, ...params } = originalParams
    const profile = await super.getProfile(authentication, params)
    const existingEntity = (await super.findEntity(profile, params)) || (await super.getCurrentEntity(params))

    const authEntity = !existingEntity
      ? await this.createEntity(profile, params)
      : await this.updateEntity(existingEntity, profile, params)

    const fetchedEntity = await super.getEntity(authEntity, originalParams)
    if (authEntity.promptForConnection) {
      fetchedEntity.promptForConnection = authEntity.promptForConnection
      fetchedEntity.associateEmail = authEntity.associateEmail
      fetchedEntity.loginId = authEntity.loginId
      fetchedEntity.loginToken = authEntity.loginToken
    }

    return {
      authentication: { strategy: this.name! },
      [entity]: fetchedEntity
    }
  }
}
export default DiscordStrategy
