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

import { Id, NullableId, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import { UserData, UserID, UserPatch, UserQuery, UserType } from '@etherealengine/engine/src/schemas/user/user.schema'

import { userApiKeyPath } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
import { Op } from 'sequelize'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { RootParams } from '../../api/root-params'
import getFreeInviteCode from '../../util/get-free-invite-code'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserParams extends RootParams<UserQuery> {}

/**
 * A class for User service
 */

export class UserService<T = UserType, ServiceParams extends Params = UserParams> extends KnexAdapter<
  UserType,
  UserData,
  UserParams,
  UserPatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params?: UserParams) {
    return super._get(id, params)
  }

  /**
   * @function find it is used to find specific users
   *
   */
  async find(params: UserParams) {
    const { search } = params.query || {}

    if (search) {
      const searchedIdentityProviders = await this.app.service('identity-provider').Model.findAll({
        where: {
          accountIdentifier: {
            [Op.like]: `%${search}%`
          }
        },
        raw: true
      })

      params.query = {
        ...params.query,
        $or: [
          {
            id: {
              $like: `%${search}%`
            }
          },
          {
            name: {
              $like: `%${search}%`
            }
          },
          {
            id: {
              $in: searchedIdentityProviders.map((ip) => ip.userId)
            }
          }
        ]
      }
    }

    const paramsWithoutExtras = {
      ...params,
      // Explicitly cloned sort object because otherwise it was affecting default params object as well.
      query: params.query ? JSON.parse(JSON.stringify(params.query)) : {}
    }

    // Remove extra params
    if (paramsWithoutExtras.query?.action || paramsWithoutExtras.query?.action === '')
      delete paramsWithoutExtras.query.action
    if (paramsWithoutExtras.query?.search || paramsWithoutExtras.query?.search === '')
      delete paramsWithoutExtras.query.search

    // Remove account identifier sort
    if (paramsWithoutExtras.query?.$sort && paramsWithoutExtras.query.$sort.accountIdentifier) {
      delete paramsWithoutExtras.query.$sort.accountIdentifier
    }

    return super._find(paramsWithoutExtras)
  }

  async create(data: UserData, params?: UserParams) {
    if (!data.inviteCode) {
      data.inviteCode = Math.random().toString(36).slice(2)
    }

    const dataWithoutExtras = { ...data } as any

    delete dataWithoutExtras.scopes
    if (!dataWithoutExtras.avatarId) delete dataWithoutExtras.avatarId

    const result = await super._create(dataWithoutExtras, params)

    if (data.scopes) result.scopes = [...data.scopes]

    await this._afterCreate(this.app, result)

    return result
  }

  async patch(id: NullableId, data: UserPatch, params?: UserParams) {
    const dataWithoutExtras = { ...data } as any

    delete dataWithoutExtras.scopes

    const result = (await super._patch(id, dataWithoutExtras, params)) as UserType | UserType[]

    await this._afterPatch(this.app, result)

    return result
  }

  async remove(id: NullableId, params?: Params) {
    if (id) {
      await this.app.service(userApiKeyPath).remove(null, {
        query: {
          userId: id as UserID
        }
      })
    }

    return await super._remove(id, params)
  }

  _afterCreate = async (app: Application, result: UserType) => {
    try {
      await app.service('user-settings').create({
        userId: result.id
      })

      if (result.scopes && result.scopes.length > 0) {
        const data = result.scopes.map((el) => {
          return {
            type: el.type,
            userId: result.id
          }
        })

        await app.service('scope').create(data)
      }

      if (result && !result.isGuest) {
        await app.service(userApiKeyPath).create({
          userId: result.id
        })
      }

      await this._afterPatch(app, result)
    } catch (err) {
      logger.error(err, `USER AFTER CREATE ERROR: ${err.message}`)
    }
  }

  _afterPatch = async (app: Application, results: UserType | UserType[]) => {
    try {
      for (const result of Array.isArray(results) ? results : [results]) {
        if (result && !result.isGuest && result.inviteCode == null) {
          const code = await getFreeInviteCode(app)
          await this._patch(result.id!, {
            inviteCode: code
          })
        }
      }
    } catch (err) {
      logger.error(err, `USER AFTER PATCH ERROR: ${err.message}`)
    }
  }
}
