import { AuthenticationRequest } from '@feathersjs/authentication'
import { Paginated, Params } from '@feathersjs/feathers'
import { random } from 'lodash'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
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
    console.log('updateEntity', entity, profile)
    const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: params?.authentication?.accessToken },
      {}
    )
    console.log('authResult', authResult)
    if (!entity.userId) {
      const avatars = (await this.app.service('avatar').find({ isInternal: true })) as Paginated<AvatarInterface>
      console.log('avatars', avatars)
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
    console.log('user for github', user)
    await makeInitialAdmin(this.app, user.id)
    if (user.isGuest)
      await this.app.service('user').patch(entity.userId, {
        isGuest: false
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
    console.log('apiKey created if not present')
    if (entity.type !== 'guest' && identityProvider.type === 'guest') {
      console.log('removing guest user')
      await this.app.service('identity-provider').remove(identityProvider.id)
      console.log('removed guest identity-provider')
      await this.app.service('user').remove(identityProvider.userId)
      console.log('removed guest user')
      return super.updateEntity(entity, profile, params)
    }
    const existingEntity = await super.findEntity(profile, params)
    console.log('existingEntity', existingEntity)
    if (!existingEntity) {
      profile.userId = user.id
      profile.oauthToken = params.access_token
      const newIP = await super.createEntity(profile, params)
      console.log('new identity-provider', newIP)
      if (entity.type === 'guest') await this.app.service('identity-provider').remove(entity.id)
      console.log('removed guest IP if needed')
      return newIP
    } else if (existingEntity.userId === identityProvider.userId) return existingEntity
    else {
      throw new Error('Another user is linked to this account')
    }
  }

  async getRedirect(data: any, params: Params): Promise<string> {
    console.log('getRedirect', data)
    const redirectHost = config.authentication.callback.github
    console.log('redirectHost', redirectHost)
    const type = params?.query?.userId ? 'connection' : 'login'
    console.log('type', type)
    if (Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string
      console.log('handling error', err)
      return redirectHost + `?error=${err}`
    } else {
      console.log('no error, redirecting')
      const token = data.accessToken as string
      console.log('token', token)
      const redirect = params.redirect
      console.log('redirect', redirect)
      let parsedRedirect
      try {
        parsedRedirect = JSON.parse(redirect)
      } catch (err) {
        parsedRedirect = {}
      }
      console.log('parsedRedirect', parsedRedirect)
      const path = parsedRedirect.path
      const instanceId = parsedRedirect.instanceId
      let returned = redirectHost + `?token=${token}&type=${type}`
      if (path != null) returned = returned.concat(`&path=${path}`)
      if (instanceId != null) returned = returned.concat(`&instanceId=${instanceId}`)
      console.log('returned', returned)
      return returned
    }
  }

  async authenticate(authentication: AuthenticationRequest, originalParams: Params) {
    originalParams.access_token = authentication.access_token
    return super.authenticate(authentication, originalParams)
  }
}
export default GithubStrategy
