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
    if (action === 'withRelation' ||
      action === 'myFriends') {
      const userId = params.query?.userId
      const search = params.query?.search as string

      delete params.query?.action
      delete params.query?.userId
      delete params.query?.search

      const UserRelationshipModel = this.app.get('sequelizeClient').models.user_relationship
      let foundUsers: any

      let where = ''
      if (!search || search === '') {
        where = 'id <> :userId'
      } else {
        where = `id <> :userId 
          AND (name LIKE :search 
          OR id IN 
            (SELECT userId FROM identity_provider 
            WHERE \`token\` LIKE :search))`
      }

      if (action === 'myFriends') {
        where = where +
          ` AND id IN
              (SELECT relatedUserId FROM user_relationship
               WHERE userId = :userId AND
                  (userRelationshipType = 'friend'
                  OR userRelationshipType = 'requested'))`
      }

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
        replacements: {
          userId,
          search: `%${search}%`,
          skip: params.query?.$skip || 0,
          limit: params.query?.$limit || 10
        }
      })

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

      foundUsers = {
        total: total[0]['COUNT(id)'],
        limit: params.query?.$limit,
        skip: params.query?.$skip,
        data: foundUsers
      }

      return foundUsers
    } else {
      return await super.find(params)
    }
  }
}
