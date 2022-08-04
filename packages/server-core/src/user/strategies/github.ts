import { AuthenticationRequest } from '@feathersjs/authentication'
import { Params } from '@feathersjs/feathers'
import { random } from 'lodash'

import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import getFreeInviteCode from '../../util/get-free-invite-code'
import makeInitialAdmin from '../../util/make-initial-admin'
import CustomOAuthStrategy from './custom-oauth'

export class GithubStrategy extends CustomOAuthStrategy {
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
      type: 'github',
      oauthToken: params.access_token,
      userName: profile.login,
      userId
    }
  }

  async updateEntity(entity: any, profile: any, params: Params): Promise<any> {
    const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: params?.authentication?.accessToken },
      {}
    )
    if (!entity.userId) {
      const avatars = await this.app.service('avatar').find({ isInternal: true })
      const code = await getFreeInviteCode(this.app)
      const newUser = (await this.app.service('user').create({
        userRole: 'user',
        inviteCode: code,
        avatarId: avatars[random(avatars.length - 1)].avatarId
      })) as UserInterface
      entity.userId = newUser.id
      await this.app.service('identity-provider').patch(entity.id, {
        userId: newUser.id
      })
    }
    const identityProvider = authResult['identity-provider']
    const user = await this.app.service('user').get(entity.userId)
    await makeInitialAdmin(this.app, user.id)
    if (user.userRole !== 'user')
      await this.app.service('user').patch(entity.userId, {
        userRole: 'user'
      })
    const apiKey = await this.app.service('user-api-key').find({
      query: {
        userId: entity.userId
      }
    })
    if ((apiKey as any).total === 0)
      await this.app.service('user-api-key').create({
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
      profile.oauthToken = params.access_token
      const newIP = await super.createEntity(profile, params)
      if (entity.type === 'guest') await this.app.service('identity-provider').remove(entity.id)
      return newIP
    } else if (existingEntity.userId === identityProvider.userId) return existingEntity
    else {
      throw new Error('Another user is linked to this account')
    }
  }

  async getRedirect(data: any, params: Params): Promise<string> {
    const redirectHost = config.authentication.callback.github
    const type = params?.query?.userId ? 'connection' : 'login'
    if (Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string
      return redirectHost + `?error=${err}`
    } else {
      const token = data.accessToken as string
      const redirect = params.redirect
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
    originalParams.access_token = authentication.access_token
    return super.authenticate(authentication, originalParams)
  }
}
export default GithubStrategy
