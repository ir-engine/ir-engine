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

import { AuthenticationRequest } from '@feathersjs/authentication'
import { Paginated, Params } from '@feathersjs/feathers'
import { random } from 'lodash'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { avatarPath, AvatarType } from '@etherealengine/engine/src/schemas/user/avatar.schema'

import { userApiKeyPath, UserApiKeyType } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
import { Application } from '../../../declarations'
import config from '../../appconfig'
import getFreeInviteCode from '../../util/get-free-invite-code'
import makeInitialAdmin from '../../util/make-initial-admin'
import CustomOAuthStrategy, { CustomOAuthParams } from './custom-oauth'

export class TwitterStrategy extends CustomOAuthStrategy {
  constructor(app: Application) {
    super()
    this.app = app
  }

  async getEntityData(profile: any, entity: any, params: Params): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {})
    const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: params?.authentication?.accessToken },
      {}
    )
    const identityProvider = authResult['identity-provider']
    const userId = identityProvider ? identityProvider.userId : params?.query ? params.query.userId : undefined

    return {
      ...baseData,
      email: profile.email,
      type: 'twitter',
      userId,
      accountIdentifier: profile.screen_name
    }
  }

  async updateEntity(entity: any, profile: any, params: Params): Promise<any> {
    console.log('updateEntity', entity, profile, params)
    const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: params?.authentication?.accessToken },
      {}
    )
    if (!entity.userId) {
      const avatars = (await this.app.service(avatarPath).find({ isInternal: true })) as Paginated<AvatarType>
      const code = await getFreeInviteCode(this.app)
      const newUser = (await this.app.service('user').create({
        isGuest: false,
        inviteCode: code,
        avatarId: avatars[random(avatars.total - 1)].id
      })) as UserInterface
      entity.userId = newUser.id
      await this.app.service('identity-provider').patch(entity.id, {
        userId: newUser.id
      })
    }
    const identityProvider = authResult['identity-provider']
    const user = await this.app.service('user').get(entity.userId)
    await makeInitialAdmin(this.app, user.id)
    if (user.isGuest)
      await this.app.service('user').patch(entity.userId, {
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
      await this.app.service('identity-provider').remove(identityProvider.id)
      await this.app.service('user').remove(identityProvider.userId)
      return super.updateEntity(entity, profile, params)
    }
    const existingEntity = await super.findEntity(profile, params)
    if (!existingEntity) {
      profile.userId = user.id
      const newIP = await super.createEntity(profile, params)
      if (entity.type === 'guest') await this.app.service('identity-provider').remove(entity.id)
      return newIP
    } else if (existingEntity.userId === identityProvider.userId) return existingEntity
    else {
      throw new Error('Another user is linked to this account')
    }
  }

  async getRedirect(data: any, params: CustomOAuthParams): Promise<string> {
    const redirectHost = config.authentication.callback.twitter
    const type = params?.query?.userId ? 'connection' : 'login'
    if (data instanceof Error || Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string
      return redirectHost + `?error=${err}`
    } else {
      const token = data.accessToken as string
      const redirect = params.redirect!
      let parsedRedirect
      try {
        parsedRedirect = JSON.parse(redirect)
      } catch (err) {
        parsedRedirect = {}
      }
      const path = parsedRedirect.path
      const instanceId = parsedRedirect.instanceId
      let returned = redirectHost + `?token=${token}&type=${type}`
      if (path != null) returned = returned.concat(`&path=${path}`)
      if (instanceId != null) returned = returned.concat(`&instanceId=${instanceId}`)
      return returned
    }
  }

  async authenticate(authentication: AuthenticationRequest, originalParams: Params) {
    if (authentication.raw.denied) {
      const error = authentication.profile.error
      if (error?.errors && error?.errors.find((err) => err.code === 89))
        throw new Error('You canceled the Twitter OAuth login flow')
      else
        throw new Error(
          'There was a problem with the Twitter OAuth login flow: ' + error?.errors[0].message || error?.errors[0]
        )
    }
    return super.authenticate(authentication, originalParams)
  }
}
export default TwitterStrategy
