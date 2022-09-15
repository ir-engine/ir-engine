import { AuthenticationRequest } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { NotAuthenticated } from '@feathersjs/errors'
import { FeathersService, Params } from '@feathersjs/feathers'
import { identity, random } from 'lodash'

import { AuthUser, AuthUserSeed, resolveAuthUser } from '@xrengine/common/src/interfaces/AuthUser'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import { Scope } from '../../scope/scope/scope.class'
import getFreeInviteCode from '../../util/get-free-invite-code'
import { User } from '../user/user.class'

export class Web3Strategy extends LocalStrategy {
  constructor(app: Application) {
    super()
    this.app = app
  }

  async findEntity(publicKey: string, params: Params): Promise<any> {
    const { service, errorMessage } = this.configuration

    if (!publicKey) {
      throw new NotAuthenticated(errorMessage)
    }

    const entityService = this.app?.service(service)!
    const result = (await entityService.find({
      query: {
        publicKey: publicKey
      }
    })) as any

    const identityProviders = result.data
    if (identityProviders.length === 0) {
      throw new NotAuthenticated(errorMessage)
    }

    const identityProvider = identityProviders[0]
    return { ...identityProvider }
  }

  async updateEntity(publicKey: string, type: string, params: Params, userId?: string): Promise<any> {
    let UserService: FeathersService<Application, User> = this.app?.service('user') as any as FeathersService<
      Application,
      User
    >
    let ScopeService: FeathersService<Application, Scope> = this.app?.service('scope') as any as FeathersService<
      Application,
      Scope
    >
    const avatars = await this.app?.service('avatar').find({ isInternal: true })
    const authResult = await (this.app?.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: params?.authentication?.accessToken },
      {}
    )
    console.log('authResult', authResult)
    let identityProvider = authResult['identity-provider']
    console.log('identityProvider', identityProvider)
    let user
    const code = await getFreeInviteCode(this.app)
    if (!identityProvider) {
      user = (await this.app?.service('user').create({
        isGuest: 0,
        inviteCode: code,
        type: type,
        avatarId: avatars[random(avatars.data.length - 1)].avatarId
      })) as UserInterface
      userId = user.id
    } else {
      user = (await this.app?.service('user').get(identityProvider.userId)) as UserInterface
      console.log('web3auth-user', user)
      await this.app?.service('user').patch(identityProvider.userId, {
        isGuest: 0,
        inviteCode: code
      })
      userId = identityProvider.userId
    }
    identityProvider = await this.app?.service('identity-provider').patch(identityProvider.id, {
      userId: userId,
      type: type,
      publicKey: publicKey
    })
    console.log('updateEntity, identityProvider', identityProvider)
    // console.log('updateEntity, userService', UserService)
    // user = await this.app?.service('user').get(userId!)
    console.log('updateEntity, userId', userId)
    console.log('UserService', UserService)
    const adminCount = await UserService.Model.count({
      include: [
        {
          model: ScopeService.Model,
          where: {
            type: 'admin:admin'
          }
        }
      ]
    })
    console.log('adminCount', adminCount)
  }

  /**
   *
   * @param authentication
   * @param params
   * @returns
   *
   * To Do: if entity is existing, then former user and identityProvider have to be deleted,
   * and if not existing, not deleted, just publicKey has to be updated
   *
   */
  async authenticate(authentication: AuthenticationRequest, params: Params): Promise<any> {
    let identityProvider
    console.log('authentication', authentication)
    try {
      identityProvider = await this.findEntity(authentication.publicKey, params)
      const authResult = await (this.app?.service('authentication') as any).strategies.jwt.authenticate(
        { accessToken: params?.authentication?.accessToken },
        {}
      )
      let provider = authResult['identity-provider'] // To be deleted
      console.log('authenticate, identityProvider', identityProvider)
      console.log('authenticate, provider', provider)
      // await this.app?.service('user').remove(provider.userId)
    } catch (err) {
      console.log('web3auth-authentication-err', err)
      console.log('authentication.addWallet', authentication.addWallet)
      if (authentication.addWallet) {
        console.log('authentication.addWallet1', authentication.addWallet)
        await this.updateEntity(authentication.publicKey, authentication.type, params)
        const identityProvider = await this.findEntity(authentication.publicKey, params)
        console.log('identityProvider authentication.addWallet', identityProvider)
        return {
          authentication: { web3: true },
          ['identity-provider']: identityProvider
        }
      }
      // throw new NotAuthenticated(err)
    }
    return {
      authentication: { web3: true },
      ['identity-provider']: identityProvider
    }
  }
}
