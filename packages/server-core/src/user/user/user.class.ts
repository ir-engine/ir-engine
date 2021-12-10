import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { Op, QueryTypes } from 'sequelize'
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
    const action = params.query?.action
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 10
    const searchUser = params.query?.data
    // this is a privacy & security vulnerability, please rethink the implementation here and on the front end.
    // if (action === 'inventory') {
    //   delete params.query?.action
    //   // WARNING: we probably dont want to do this
    //   return await super.find(params)
    // } else
    if (action === 'withRelation') {
      const userId = params.query?.userId
      const search = params.query?.search as string

      delete params.query?.action
      delete params.query?.userId
      delete params.query?.search

      const UserRelationshipModel = this.app.get('sequelizeClient').models.user_relationship
      let foundUsers: any

      // TODO: Clean up this inline raw SQL
      if (search && search !== '') {
        const where = `id <> :userId 
          AND (name LIKE :search 
          OR id IN 
            (SELECT userId FROM identity_provider 
            WHERE \`token\` LIKE :search))`
        const countQuery = `SELECT COUNT(id) FROM \`user\` WHERE ${where}`
        const dataQuery = `SELECT * FROM \`user\` WHERE ${where} LIMIT :skip, :limit`

        const total = await this.app.get('sequelizeClient').query(countQuery, {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            userId,
            search: `%${search}%`
          }
        })
        foundUsers = await this.app.get('sequelizeClient').query(dataQuery, {
          type: QueryTypes.SELECT,
          model: this.getModel(params),
          mapToModel: true,
          replacements: {
            userId,
            search: `%${search}%`,
            $skip: params.query?.$skip || 0,
            $limit: params.query?.$limit || 10
          }
        })

        foundUsers = {
          total,
          $limit: params.query?.$limit || 10,
          $skip: params.query?.$skip || 0,
          data: foundUsers
        }
      } else {
        params.query = {
          ...params.query,
          id: {
            $nin: [userId]
          }
        }

        foundUsers = await super.find(params)
      }

      let users
      if (!Array.isArray(foundUsers)) {
        users = foundUsers.data
      } else {
        users = foundUsers
      }

      for (const user of users) {
        const userRelation = await UserRelationshipModel.findOne({
          where: {
            userId,
            relatedUserId: user.id
          },
          attributes: ['userRelationshipType']
        })

        const userInverseRelation = await UserRelationshipModel.findOne({
          where: {
            userId: user.id,
            relatedUserId: userId
          },
          attributes: ['userRelationshipType']
        })

        if (userRelation) {
          Object.assign(user, { relationType: userRelation.userRelationshipType })
        }
        if (userInverseRelation) {
          Object.assign(user, { inverseRelationType: userInverseRelation.userRelationshipType })
        }
      }

      return foundUsers
    } else if (action === 'friends') {
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

      await Promise.all(
        userResult.rows.map((user) => {
          return new Promise(async (resolve) => {
            const userAvatarResult = (await this.app.service('static-resource').find({
              query: {
                staticResourceType: 'user-thumbnail',
                userId: user.id
              }
            })) as any

            if (userAvatarResult.total > 0) {
              user.dataValues.avatarUrl = userAvatarResult.data[0].url
            }

            resolve(true)
          })
        })
      )

      return {
        skip: skip,
        limit: limit,
        total: userResult.count,
        data: userResult.rows
      }
    } else if (action === 'layer-users') {
      const loggedInUser = extractLoggedInUserFromParams(params)
      let user
      if (loggedInUser) user = await super.get(loggedInUser.userId)
      return super.find({
        query: {
          $limit: params.query!.$limit || 10,
          $skip: params.query!.$skip || 0,
          instanceId: params.query!.instanceId || user.instanceId || 'intentionalBadId'
        }
      })
    } else if (action === 'channel-users') {
      const loggedInUser = extractLoggedInUserFromParams(params)
      let user
      if (loggedInUser) user = await super.get(loggedInUser.userId)
      return super.find({
        query: {
          $limit: params.query!.$limit || 10,
          $skip: params.query!.$skip || 0,
          channelInstanceId: params.query!.channelId || user.channelInstanceId || 'intentionalBadId'
        }
      })
    } else if (action === 'admin') {
      const loggedInUser = extractLoggedInUserFromParams(params)
      const user = await super.get(loggedInUser.userId)
      if (user.userRole !== 'admin') throw new Forbidden('Must be system admin to execute this action')

      delete params.query!.action
      // return await super.find(params)
      const users = await super.find({
        ...params,
        include: [
          {
            model: (this.app.service('scope') as any).Model,
            require: false
          }
        ],
        raw: true,
        nest: true
      })
      return users
    } else if (action === 'search') {
      const searchedUser = await (this.app.service('user') as any).Model.findAll({
        where: {
          name: {
            [Op.like]: `%${searchUser}%`
          }
        },
        include: [
          {
            model: (this.app.service('party') as any).Model,
            required: false,
            include: [
              {
                model: (this.app.service('location') as any).Model,
                required: false
              },
              {
                model: (this.app.service('instance') as any).Model,
                required: false
              }
            ]
          }
        ],
        raw: true,
        nest: true
      })
      return {
        skip: skip,
        limit: limit,
        total: searchUser.length,
        data: searchedUser
      }
    } else if (action === 'invite-code-lookup') {
      return super.find({
        query: {
          $skip: params.query!.$skip || 0,
          $limit: params.query!.$limit || 10,
          inviteCode: params.query!.inviteCode
        }
      })
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
