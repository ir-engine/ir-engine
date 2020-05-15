import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import {
  Params
} from '@feathersjs/feathers'

export class User extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<any> {
    const action = params.query?.action
    if (action === 'withRelation') {
      const userId = params.query?.userId

      delete params.query?.action
      delete params.query?.userId

      params.query = {
        ...params.query,
        id: {
          $nin: [userId]
        }
      }

      const UserRelationshipModel = this.app.get('sequelizeClient').models.user_relationship
      const foundUsers = await super.find(params)
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
          attributes: ['type']
        })
        const userInverseRelation = await UserRelationshipModel.findOne({
          where: {
            userId: user.id,
            relatedUserId: userId
          },
          attributes: ['type']
        })

        if (userRelation) {
          Object.assign(user, { relationType: userRelation.type })
        }
        if (userInverseRelation) {
          Object.assign(user, { inverseRelationType: userInverseRelation.type })
        }
      }

      return foundUsers
    } else {
      return await super.find(params)
    }
  }
}
