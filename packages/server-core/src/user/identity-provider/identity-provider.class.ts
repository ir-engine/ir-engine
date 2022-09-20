import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { random } from 'lodash'
import { Sequelize } from 'sequelize'
import { v1 as uuidv1 } from 'uuid'

import { IdentityProviderInterface } from '@xrengine/common/src/dbmodels/IdentityProvider'
import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { isDev } from '@xrengine/common/src/utils/isDev'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { scopeTypeSeed } from '../../scope/scope-type/scope-type.seed'
import getFreeInviteCode from '../../util/get-free-invite-code'
import { UserParams } from '../user/user.class'

interface IdentityProviderParams extends UserParams {
  bot?: boolean
}

/**
 * A class for identity-provider service
 */
export class IdentityProvider<T = IdentityProviderInterface> extends Service<T> {
  public app: Application
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * A method used to create accessToken
   *
   * @param data which contains token and type
   * @param params
   * @returns accessToken
   */
  async create(data: any, params: IdentityProviderParams = {}): Promise<T & { accessToken?: string }> {
    let { token, type, password } = data
    let user
    let authResult

    if (params.authentication) {
      authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
        { accessToken: params.authentication.accessToken },
        {}
      )
      if (authResult[config.authentication.entity]?.userId) {
        user = await this.app.service('user').get(authResult[config.authentication.entity]?.userId)
      }
    }
    if (
      (!user || !user.scopes || !user.scopes.find((scope) => scope.type === 'admin:admin')) &&
      params.provider &&
      type !== 'password' &&
      type !== 'email' &&
      type !== 'sms'
    )
      type = 'guest' //Non-password/magiclink create requests must always be for guests
    let userId = data.userId || (authResult ? authResult[config.authentication.entity]?.userId : null)
    let identityProvider: any

    switch (type) {
      case 'email':
        identityProvider = {
          token,
          type
        }
        break
      case 'sms':
        identityProvider = {
          token,
          type
        }
        break
      case 'password':
        identityProvider = {
          token,
          password,
          type
        }
        break
      case 'github':
        identityProvider = {
          token: token,
          type
        }
        break
      case 'facebook':
        identityProvider = {
          token: token,
          type
        }
        break
      case 'google':
        identityProvider = {
          token: token,
          type
        }
        break
      case 'twitter':
        identityProvider = {
          token: token,
          type
        }
        break
      case 'linkedin':
        identityProvider = {
          token: token,
          type
        }
        break
      case 'discord':
        identityProvider = {
          token: token,
          type
        }
        break
      case 'guest':
        identityProvider = {
          token: token,
          type: type
        }
        break
      case 'auth0':
        break
    }

    // if userId is not defined, then generate userId
    if (!userId) {
      userId = uuidv1()
    }

    const sequelizeClient: Sequelize = this.app.get('sequelizeClient')
    const userService = this.app.service('user')
    const User = sequelizeClient.model('user')

    // check if there is a user with userId
    let foundUser
    try {
      foundUser = await userService.get(userId)
    } catch (err) {}

    if (foundUser != null) {
      // if there is the user with userId, then we add the identity provider to the user
      return (await super.create(
        {
          ...data,
          ...identityProvider,
          userId
        },
        params
      )) as T & { accessToken?: string }
    }

    // create with user association
    params.sequelize = {
      include: [User]
    }

    const code = await getFreeInviteCode(this.app)
    // if there is no user with userId, then we create a user and a identity provider.
    const adminCount = await this.app.service('user').Model.count({
      include: [
        {
          model: this.app.service('scope').Model,
          where: {
            type: 'admin:admin'
          }
        }
      ]
    })
    const avatars = (await this.app
      .service('avatar')
      .find({ isInternal: true, query: { $limit: 1000 } })) as Paginated<AvatarInterface>

    let isGuest = type === 'guest'

    if (adminCount === 0) {
      // in dev mode make the first guest an admin
      // otherwise make the first logged in user an admin
      if (isDev || !isGuest) {
        type = 'admin'
      }
    }

    let result
    try {
      result = await super.create(
        {
          ...data,
          ...identityProvider,
          user: {
            id: userId,
            isGuest,
            inviteCode: type === 'guest' ? null : code,
            avatarId: avatars.data[random(avatars.data.length - 1)].id
          }
        },
        params
      )
    } catch (err) {
      console.error(err)
      await this.app.service('user').remove(userId)
      throw err
    }
    // DRC

    if (type === 'guest') {
      if (config.scopes.guest.length) {
        const data = config.scopes.guest.map((el) => {
          return {
            type: el,
            userId
          }
        })
        await this.app.service('scope').create(data)
      }

      result.accessToken = await this.app
        .service('authentication')
        .createAccessToken({}, { subject: result.id.toString() })
    } else if (isDev && type === 'admin') {
      // in dev mode, add all scopes to the first user made an admin
      const data = scopeTypeSeed.templates.map(({ type }) => {
        return { userId, type }
      })
      await this.app.service('scope').create(data)

      result.accessToken = await this.app
        .service('authentication')
        .createAccessToken({}, { subject: result.id.toString() })
    }
    return result
  }

  async find(params?: UserParams): Promise<T[] | Paginated<T>> {
    const loggedInUser = params!.user as UserInterface
    if (params!.provider) params!.query!.userId = loggedInUser.id
    return super.find(params)
  }
}
