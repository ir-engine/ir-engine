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

import { Forbidden } from '@feathersjs/errors'
import { NullableId, Params } from '@feathersjs/feathers'
import { Paginated } from '@feathersjs/feathers/lib'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { AdminScopeType } from '@etherealengine/common/src/interfaces/AdminScopeType'
import { CreateEditUser, UserInterface, UserScope } from '@etherealengine/common/src/interfaces/User'

import { userApiKeyPath } from '@etherealengine/engine/src/schemas/user/user-api-key.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import getFreeInviteCode from '../../util/get-free-invite-code'

export interface UserParams extends Params {
  user?: UserInterface
  paginate?: false
  isInternal?: boolean
  sequelize?: any
}

export const afterCreate = async (app: Application, result: UserInterface, scopes?: UserScope[] | AdminScopeType[]) => {
  await app.service('user-settings').create({
    userId: result.id
  })

  if (scopes && scopes.length > 0) {
    const data = scopes.map((el) => {
      return {
        type: el.type,
        userId: result.id
      }
    })
    app.service('scope').create(data)
  }

  if (Array.isArray(result)) result = result[0]
  if (!result?.isGuest)
    await app.service(userApiKeyPath).create({
      userId: result.id
    })
  if (!result?.isGuest && result?.inviteCode == null) {
    const code = await getFreeInviteCode(app)
    await app.service('user').patch(result.id, {
      inviteCode: code
    })
  }
}

export const afterPatch = async (app: Application, result: UserInterface) => {
  try {
    if (Array.isArray(result)) result = result[0]
    if (result && !result.isGuest && result.inviteCode == null) {
      const code = await getFreeInviteCode(app)
      await app.service('user').patch(result.id, {
        inviteCode: code
      })
    }
  } catch (err) {
    logger.error(err, `USER AFTER PATCH ERROR: ${err.message}`)
  }
}

/**
 * This class used to find user
 * and returns founded users
 */
export class User extends Service<UserInterface> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * @function find it is used to find specific users
   *
   * @param params user id
   * @returns {@Array} of found users
   */

  async find(params?: UserParams): Promise<UserInterface[] | Paginated<UserInterface>> {
    if (!params) params = {}
    if (!params.query) params.query = {}
    const { action, $skip, $limit, search, ...query } = params.query!

    delete query.search

    const loggedInUser = params!.user as any

    if (action === 'admin') {
      delete params.query.action
      delete params.query.search
      if (!params.isInternal && !loggedInUser.scopes.find((scope) => scope.type === 'admin:admin'))
        throw new Forbidden('Must be system admin to execute this action')

      const searchedUser = await this.app.service('user').Model.findAll({
        where: {
          [Op.or]: [
            {
              id: {
                [Op.like]: `%${search}%`
              }
            },
            {
              name: {
                [Op.like]: `%${search}%`
              }
            }
          ]
        },
        raw: true
      })
      const searchedIdentityProviders = await this.app.service('identity-provider').Model.findAll({
        where: {
          accountIdentifier: {
            [Op.like]: `%${search}%`
          }
        },
        raw: true
      })

      if (search) {
        const userIds = searchedUser.map((user) => user.id)
        const ipUserIds = searchedIdentityProviders.map((ip) => ip.userId)

        params.query.id = {
          $in: [...userIds, ...ipUserIds]
        }
      }

      const order: any[] = []
      const { $sort } = params?.query ?? {}
      if ($sort != null)
        Object.keys($sort).forEach((name) => {
          if (name === 'location') {
            order.push(['instance', 'location', 'name', $sort[name] === 0 ? 'DESC' : 'ASC'])
          } else {
            order.push([name, $sort[name] === 0 ? 'DESC' : 'ASC'])
          }
        })

      if (order.length > 0) {
        params.sequelize.order = order
      }

      delete params?.query?.$sort
      return super.find(params)
    } else if (action === 'invite-code-lookup') {
      delete params.query.action
      return super.find(params)
    } else {
      if (
        loggedInUser.scopes &&
        !(
          loggedInUser?.scopes.find((scope) => scope.type === 'admin:admin') &&
          loggedInUser?.scopes.find((scope) => scope.type === 'user:read')
        ) &&
        !params.isInternal
      )
        throw new Forbidden('Must be system admin with user:read scope to execute this action')
      return await super.find(params)
    }
  }

  async create(data: Partial<CreateEditUser>, params?: Params): Promise<UserInterface | UserInterface[]> {
    data.inviteCode = Math.random().toString(36).slice(2)
    const result = (await super.create(data, params)) as UserInterface
    try {
      await afterCreate(this.app, result, data.scopes)
    } catch (err) {
      logger.error(err, `USER AFTER CREATE ERROR: ${err.message}`)
      return null!
    }
    return result
  }

  async patch(id: NullableId, data: any, params?: Params): Promise<UserInterface> {
    const result = (await super.patch(id, data, params)) as UserInterface
    await afterPatch(this.app, result)
    return result
  }

  async remove(id: NullableId, params?: Params) {
    if (id) {
      await this.app.service(userApiKeyPath).remove(null, {
        query: {
          userId: id.toString()
        }
      })
    }

    return super.remove(id, params)
  }
}
