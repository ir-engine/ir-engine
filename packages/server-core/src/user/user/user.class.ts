import { Forbidden } from '@feathersjs/errors'
import { NullableId, Params } from '@feathersjs/feathers'
import { Paginated } from '@feathersjs/feathers/lib'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import Sequelize, { Op } from 'sequelize'

import { User as UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'

export type UserDataType = UserInterface
/**
 * This class used to find user
 * and returns founded users
 */
export class User<T = UserDataType> extends Service<T> {
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

  async find(params?: Params): Promise<T[] | Paginated<T>> {
    if (!params) params = {}
    if (!params.query) params.query = {}
    const { action, $skip, $limit, search, ...query } = params.query!

    const skip = $skip ? $skip : 0
    const limit = $limit ? $limit : 10

    delete query.search

    const loggedInUser = params!.user as any

    if (action === 'friends') {
      delete params.query.action
      const loggedInUser = params!.user as UserDataType
      const userResult = await this.app.service('user').Model.findAndCountAll({
        offset: skip,
        limit: limit,
        order: [['name', 'ASC']],
        include: [
          {
            model: this.app.service('user-relationship').Model,
            where: {
              relatedUserId: loggedInUser.id,
              userRelationshipType: 'friend'
            }
          }
        ]
      })

      params.query.id = {
        $in: userResult.rows.map((user) => user.id)
      }
      return super.find(params)
    } else if (action === 'layer-users') {
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
      if (!params.isInternal && loggedInUser.userRole !== 'admin')
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
        Object.keys($sort).forEach((name, val) => {
          if (name === 'location') {
            order.push([Sequelize.literal('`party.location.name`'), $sort[name] === 0 ? 'DESC' : 'ASC'])
          } else {
            order.push([name, $sort[name] === 0 ? 'DESC' : 'ASC'])
          }
        })

      if (order.length > 0) {
        params.sequelize.order = order
      }
      delete params?.query?.$sort
      params.sequelize.subQuery = false
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
      if (loggedInUser?.userRole !== 'admin' && !params.isInternal)
        throw new Forbidden('Must be system admin to execute this action')
      return await super.find(params)
    }
  }

  async create(data: any, params?: Params): Promise<T | T[]> {
    data.inviteCode = Math.random().toString(36).slice(2)
    return await super.create(data, params)
  }

  patch(id: NullableId, data: any, params?: Params): Promise<T | T[]> {
    return super.patch(id, data, params)
  }
}
