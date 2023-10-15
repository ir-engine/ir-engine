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

import type { Id, NullableId, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import {
  IdentityProviderData,
  IdentityProviderPatch,
  IdentityProviderQuery,
  IdentityProviderType
} from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { Paginated } from '@feathersjs/feathers'
import { random } from 'lodash'
import { v1 as uuidv1 } from 'uuid'

import { isDev } from '@etherealengine/common/src/config'
import { avatarPath, AvatarType } from '@etherealengine/engine/src/schemas/user/avatar.schema'

import { scopePath, ScopeType } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import { userPath, UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'

import { scopeTypePath } from '@etherealengine/engine/src/schemas/scope/scope-type.schema'
import { KnexAdapterParams } from '@feathersjs/knex'
import appConfig from '../../appconfig'
import getFreeInviteCode from '../../util/get-free-invite-code'

export interface IdentityProviderParams extends KnexAdapterParams<IdentityProviderQuery> {
  authentication?: any
}

/**
 * A class for IdentityProvider service
 */

export class IdentityProviderService<
  T = IdentityProviderType,
  ServiceParams extends Params = IdentityProviderParams
> extends KnexAdapter<IdentityProviderType, IdentityProviderData, IdentityProviderParams, IdentityProviderPatch> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async create(data: IdentityProviderData, params?: IdentityProviderParams) {
    if (!params) params = {}
    let { token, type } = data
    let user
    let authResult

    if (params?.authentication) {
      authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
        { accessToken: params?.authentication.accessToken },
        {}
      )
      if (authResult[appConfig.authentication.entity]?.userId) {
        user = await this.app.service(userPath).get(authResult[appConfig.authentication.entity]?.userId)
      }
    }
    if (
      (!user || !user.scopes || !user.scopes.find((scope) => scope.type === 'admin:admin')) &&
      params?.provider &&
      type !== 'password' &&
      type !== 'email' &&
      type !== 'sms'
    )
      type = 'guest' //Non-password/magiclink create requests must always be for guests

    let userId = data.userId || (authResult ? authResult[appConfig.authentication.entity]?.userId : null)
    let identityProvider: IdentityProviderData = { ...data }

    switch (type) {
      case 'email':
        identityProvider = {
          ...identityProvider,
          token,
          type
        }
        break
      case 'sms':
        identityProvider = {
          ...identityProvider,
          token,
          type
        }
        break
      case 'password':
        identityProvider = {
          ...identityProvider,
          token,
          type
        }
        break
      case 'github':
        identityProvider = {
          ...identityProvider,
          token: token,
          type
        }
        break
      case 'facebook':
        identityProvider = {
          ...identityProvider,
          token: token,
          type
        }
        break
      case 'google':
        identityProvider = {
          ...identityProvider,
          token: token,
          type
        }
        break
      case 'twitter':
        identityProvider = {
          ...identityProvider,
          token: token,
          type
        }
        break
      case 'linkedin':
        identityProvider = {
          ...identityProvider,
          token: token,
          type
        }
        break
      case 'discord':
        identityProvider = {
          ...identityProvider,
          token: token,
          type
        }
        break
      case 'guest':
        identityProvider = {
          ...identityProvider,
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

    // check if there is a user with userId
    let foundUser
    try {
      foundUser = await this.app.service(userPath).get(userId)
    } catch (err) {
      //
    }

    if (foundUser != null) {
      // if there is the user with userId, then we add the identity provider to the user
      return await super._create(
        {
          ...identityProvider,
          userId
        },
        params
      )
    }

    const code = await getFreeInviteCode(this.app)
    // if there is no user with userId, then we create a user and a identity provider.
    const adminCount = (await this.app.service(scopePath).find({
      query: {
        type: 'admin:admin'
      }
    })) as Paginated<ScopeType>

    const avatars = (await this.app
      .service(avatarPath)
      .find({ isInternal: true, query: { $limit: 1000 } })) as Paginated<AvatarType>

    const isGuest = type === 'guest'

    if (adminCount.data.length === 0) {
      // in dev mode make the first guest an admin
      // otherwise make the first logged in user an admin
      if (isDev || !isGuest) {
        type = 'admin'
      }
    }

    let result: IdentityProviderType
    try {
      const newUser = (await this.app.service(userPath).create({
        id: userId,
        isGuest,
        inviteCode: type === 'guest' ? '' : code,
        avatarId: avatars.data[random(avatars.data.length - 1)].id
      })) as UserType

      result = await super._create(
        {
          ...identityProvider,
          userId: newUser.id
        },
        params
      )
    } catch (err) {
      console.error(err)
      await this.app.service(userPath).remove(userId)
      throw err
    }
    // DRC

    if (type === 'guest') {
      if (appConfig.scopes.guest.length) {
        const data = appConfig.scopes.guest.map((el) => {
          return {
            type: el,
            userId
          }
        })
        await this.app.service(scopePath).create(data)
      }

      result.accessToken = await this.app
        .service('authentication')
        .createAccessToken({}, { subject: result.id.toString() })
    } else if (isDev && type === 'admin') {
      // in dev mode, add all scopes to the first user made an admin
      const scopeTypes = await this.app.service(scopeTypePath).find({
        paginate: false
      })

      const data = scopeTypes.map(({ type }) => {
        return { userId, type }
      })
      await this.app.service(scopePath).create(data)

      result.accessToken = await this.app
        .service('authentication')
        .createAccessToken({}, { subject: result.id.toString() })
    }

    return result
  }

  async find(params?: IdentityProviderParams) {
    const loggedInUser = params!.user as UserType
    if (params!.provider) params!.query!.userId = loggedInUser.id
    return super._find(params)
  }

  async get(id: Id, params?: IdentityProviderParams) {
    return super._get(id, params)
  }

  async patch(id: Id, data: IdentityProviderData, params?: IdentityProviderParams) {
    return super._patch(id, data, params)
  }

  async remove(id: NullableId, params?: IdentityProviderParams) {
    return super._remove(id, params)
  }
}
