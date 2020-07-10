import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import {
  Params
} from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'

export class User extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<any> {
    const action = params.query?.action
    console.log(params.query)
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

        const total = await this.app.get('sequelizeClient').query(countQuery,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: {
              userId,
              search: `%${search}%`
            }
          })
        foundUsers = await this.app.get('sequelizeClient').query(dataQuery,
          {
            type: QueryTypes.SELECT,
            model: this.getModel(params),
            mapToModel: true,
            replacements: {
              userId,
              search: `%${search}%`,
              skip: params.query?.$skip || 0,
              limit: params.query?.$limit || 10
            }
          })

        foundUsers = {
          total,
          limit: params.query?.$limit,
          skip: params.query?.$skip,
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
      const userRelationshipResult = await this.app.service('user-relationship').find({
        query: {
          userRelationshipType: 'friend',
          relatedUserId: params.query?.userId
        }
      })

      const friendIds = (userRelationshipResult as any).data.map((item) => {
        return item.userId
      })

      return this.app.service('user').find({
        query: {
          id: {
            $in: friendIds
          }
        }
      })
    } else {
      return await super.find(params)
    }
  }
}
