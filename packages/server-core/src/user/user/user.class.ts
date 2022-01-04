import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { Op } from 'sequelize'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { Forbidden } from '@feathersjs/errors'

/**
 * This class used to find user
 * and returns founded users
 */
export class User extends Service {
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

  async find(params: Params): Promise<any> {
    if (!params.query) params.query = {}
    const action = params.query.action
    const skip = params.query.$skip ? params.query.$skip : 0
    const limit = params.query.$limit ? params.query.$limit : 10
    // this is a privacy & security vulnerability, please rethink the implementation here and on the front end.
    // if (action === 'inventory') {
    //   delete params.query?.action
    //   // WARNING: we probably dont want to do this
    //   return await super.find(params)
    // } else
    if (action === 'friends') {
      delete params.query.action
      const loggedInUser = extractLoggedInUserFromParams(params)
      const userResult = await (this.app.service('user') as any).Model.findAndCountAll({
        offset: skip,
        limit: limit,
        order: [['name', 'ASC']],
        include: [
          {
            model: (this.app.service('user-relationship') as any).Model,
            where: {
              relatedUserId: loggedInUser.userId,
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
      const loggedInUser = extractLoggedInUserFromParams(params)
      let user
      if (loggedInUser) user = await super.get(loggedInUser.userId)
      params.query.instanceId = params.query.instanceId || user.instanceId || 'intentionalBadId'
      return super.find(params)
    } else if (action === 'channel-users') {
      delete params.query.action
      const loggedInUser = extractLoggedInUserFromParams(params)
      let user
      if (loggedInUser) user = await super.get(loggedInUser.userId)
      params.query.channelInstanceId = params.query.channelInstanceId || user.channelInstanceId || 'intentionalBadId'
      return super.find(params)
    } else if (action === 'admin') {
      delete params.query.action
      const loggedInUser = extractLoggedInUserFromParams(params)
      const user = await super.get(loggedInUser.userId)
      if (user.userRole !== 'admin') throw new Forbidden('Must be system admin to execute this action')

      // return await super.find(params)
      return super.find(params)
    } else if (action === 'search') {
      const searchUser = params.query.data
      delete params.query.action
      const searchedUser = await (this.app.service('user') as any).Model.findAll({
        where: {
          name: {
            [Op.like]: `%${searchUser}%`
          }
        },
        raw: true,
        nest: true
      })
      params.query.id = {
        $in: searchUser.map((user) => user.id)
      }
      return super.find(params)
    } else if (action === 'invite-code-lookup') {
      delete params.query.action
      return super.find(params)
    } else {
      const loggedInUser = extractLoggedInUserFromParams(params)
      let user
      if (loggedInUser) user = await super.get(loggedInUser.userId)
      if (user?.userRole !== 'admin' && params.isInternal != true)
        return new Forbidden('Must be system admin to execute this action')
      return await super.find(params)
    }
  }

  // async create (params: Params): Promise<any> {
  //   const data = params;
  //   data.inviteCode =  Math.random().toString(36).slice(2);
  //   return await super.create(data);
  // }
}
