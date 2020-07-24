import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { Params } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'

export class Group extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params)
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 10
    const groupResult = await this.app.service('group').Model.findAndCountAll({
      offset: skip,
      limit: limit,
      order: [
          ['name', 'ASC']
      ],
      include: [{
        model: this.app.service('user').Model,
        where: {
          id: loggedInUser.userId
        }
      }]
    })
    console.log(groupResult)
    return {
      skip: skip,
      limit: limit,
      total: groupResult.count,
      data: groupResult.rows
    }
    // const groupUserResult = await this.app.service('group-user').find({
    //   query: {
    //     userId: loggedInUser.userId,
    //     $limit: params.query?.$limit ? params.query.$limit : 10,
    //     $skip: params.query?.$skip ? params.query.$skip : 0,
    //     $sort: {
    //       createdAt: -1
    //     }
    //   }
    // })
    //
    // console.log(groupUserResult)
    // let groupIds = (groupUserResult as any).data.map((groupUser) => {
    //   return groupUser.groupId
    // })
    //
    // const groupResult = await super.find({
    //   query: {
    //     id: {
    //       $in: groupIds
    //     }
    //   }
    // });
    //
    // (groupResult as any).total = (groupUserResult as any).total;
    // (groupResult as any).limit = (groupUserResult as any).limit;
    // (groupResult as any).skip = (groupUserResult as any).skip

    // return groupResult
  }
}