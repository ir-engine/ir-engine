import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { Op } from 'sequelize'

/**
 * A class for Croup service
 *
 * @author Vyacheslav Solovjov
 */
export class Group extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
  /**
   * A method which find group
   *
   * @param params of query which contains group limit and number skip
   * @returns {@Object} of group
   * @author Vyacheslav Solovjov
   */

  async find(params: Params): Promise<any> {
    const loggedInUser = extractLoggedInUserFromParams(params)
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 10
    const include: any = [
      {
        model: (this.app.service('user') as any).Model,
        where: {
          id: loggedInUser.id
        }
      },
      {
        model: (this.app.service('scope') as any).Model,
        require: false
      }
    ]
    if (params.query?.invitable === true) {
      include.push({
        model: (this.app.service('group-user') as any).Model,
        where: {
          userId: loggedInUser.id,
          [Op.or]: [
            {
              groupUserRank: 'owner'
            },
            {
              groupUserRank: 'admin'
            }
          ]
        }
      })
    }
    const groupResult = await (this.app.service('group') as any).Model.findAndCountAll({
      offset: skip,
      limit: limit,
      order: [['name', 'ASC']],
      include: include
    })
    await Promise.all(
      groupResult.rows.map((group) => {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
        return new Promise(async (resolve) => {
          const groupUsers = await (this.app.service('group-user') as any).Model.findAll({
            where: {
              groupId: group.id
            },
            include: [
              {
                model: (this.app.service('user') as any).Model
              }
            ]
          })
          // await Promise.all(groupUsers.map(async (groupUser) => {
          //   const avatarResult = await this.app.service('static-resource').find({
          //     query: {
          //       staticResourceType: 'user-thumbnail',
          //       userId: groupUser.userId
          //     }
          //   }) as any;
          //
          //   if (avatarResult.total > 0) {
          //     groupUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
          //   }
          //
          //   return await Promise.resolve();
          // }));

          group.dataValues.groupUsers = groupUsers
          resolve(true)
        })
      })
    )
    return {
      skip: skip,
      limit: limit,
      total: groupResult.count,
      data: groupResult.rows
    }
  }
}
