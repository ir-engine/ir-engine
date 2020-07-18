import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import {Params, Query} from "@feathersjs/feathers";
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'

export class Group extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params)
    const groupUserResult = await this.app.service('group-user').find({
      query: {
        userId: loggedInUser.userId,
        $limit: params.query?.$limit ? params.query.$limit : 10,
        $skip: params.query?.$skip ? params.query.$skip : 0,
        $sort: {
          createdAt: -1
        }
      }
    })

    let groupIds = (groupUserResult as any).data.map((groupUser) => {
      return groupUser.groupId
    })

    return super.find({
      query: {
        id: {
          $in: groupIds
        }
      }
    })
  }

}
