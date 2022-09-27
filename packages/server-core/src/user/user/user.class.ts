import { Forbidden } from '@feathersjs/errors'
import { NullableId, Params } from '@feathersjs/feathers'
import { Paginated } from '@feathersjs/feathers/lib'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { CreateEditUser, UserInterface, UserScope } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import getFreeInviteCode from '../../util/get-free-invite-code'

export interface UserParams extends Params {
  user?: UserInterface
  paginate?: false
  isInternal?: boolean
  sequelize?: any
}

export const afterCreate = async (app: Application, result: UserInterface, scopes?: UserScope[]) => {
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
    await app.service('user-api-key').create({
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

    if (action === 'layer-users') {
      delete params.query.action
      params.query.instanceId = params.query.instanceId || loggedInUser.instanceId || 'intentionalBadId'
      return super.find(params)
    } else if (action === 'channel-users') {
      delete params.query.action
      params.query.channelInstanceId =
        params.query.channelInstanceId || loggedInUser.channelInstanceId || 'intentionalBadId'
      return super.find(params)
    } else if (action === 'admin') {
      delete params.query.action
      delete params.query.search
      if (!params.isInternal && !loggedInUser.scopes.find((scope) => scope.type === 'admin:admin'))
        throw new Forbidden('Must be system admin to execute this action')

      const searchedUser = await this.app.service('user').Model.findAll({
        where: {
          name: {
            [Op.like]: `%${search}%`
          }
        },
        raw: true
      })

      if (search) {
        params.query.id = {
          $in: searchedUser.map((user) => user.id)
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
    } else if (action === 'search') {
      const searchUser = params.query.data
      delete params.query.action
      const searchedUser = await this.app.service('user').Model.findAll({
        where: {
          name: {
            [Op.like]: `%${searchUser}%`
          }
        },
        raw: true,
        nest: true
      })
      params.query.id = {
        $in: searchedUser.map((user) => user.id)
      }
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
    const userId = id
    await this.app.service('user-api-key').remove(null, {
      query: {
        userId: userId
      }
    })
    return super.remove(id, params)
  }
}
