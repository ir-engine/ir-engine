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

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { RedirectConfig } from '../../types/OauthStrategies'
import getFreeInviteCode from '../../util/get-free-invite-code'
import makeInitialAdmin from '../../util/make-initial-admin'
import CustomOAuthStrategy, { CustomOAuthParams } from './custom-oauth'

export class FacebookStrategy extends CustomOAuthStrategy {
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

    return {
      ...baseData,
      accountIdentifier: profile.name,
      type: 'facebook',
      userId
    }
  }

  async updateEntity(entity: any, profile: any, params: Params): Promise<any> {
    const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: params?.authentication?.accessToken },
      {}
    )
    if (!entity.userId) {
      const code = (await getFreeInviteCode(this.app)) as InviteCode
      const newUser = await this.app.service(userPath).create({
        name: '' as UserName,
        isGuest: false,
        inviteCode: code
      })
      entity.userId = newUser.id
      await this.app.service(identityProviderPath).patch(entity.id, {
        userId: newUser.id
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
      if (entity.type === 'guest') await this.app.service(identityProviderPath).remove(entity.id)
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
    redirectDomain = redirectDomain ? `${redirectDomain}/auth/oauth/facebook` : config.authentication.callback.facebook

    if (data instanceof Error || Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string
      return redirectDomain + `?error=${err}`
    }

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

  async authenticate(authentication: AuthenticationRequest, originalParams: Params) {
    if (authentication.error) {
      if (authentication.error?.error?.type === 'OAuthException')
        throw new Error('You canceled the GitHub OAuth login flow')
      else
        throw new Error(
          'There was a problem with the Facebook OAuth login flow: ' + authentication.error?.error?.message
        )
    }
    return super.authenticate(authentication, originalParams)
  }
}
export default FacebookStrategy
