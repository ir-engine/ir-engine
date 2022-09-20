import { Paginated } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { Group as GroupInterface } from '@xrengine/common/src/interfaces/Group'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import { UserParams } from '../../user/user/user.class'

export type GroupDataType = GroupInterface
/**
 * A class for Croup service
 */
export class Group<T = GroupDataType> extends Service<T> {
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
   */

  async find(params?: UserParams): Promise<Paginated<T>> {
    const loggedInUser = params!.user as UserInterface
    const skip = params?.query?.$skip ? params.query.$skip : 0
    const limit = params?.query?.$limit ? params.query.$limit : 10
    const search = params?.query?.search
    const sort = params?.query?.$sort
    const order: any[] = []
    if (sort != null) {
      Object.keys(sort).forEach((name, val) => {
        order.push([name, sort[name] === 0 ? 'DESC' : 'ASC'])
      })
    } else {
      order.push(['name', 'ASC'])
    }

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
    if (params?.query?.invitable === true) {
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
    let q = {}
    if (search) {
      q = { name: { [Op.like]: `%${search}%` } }
    }

    const groupResult = await (this.app.service('group') as any).Model.findAndCountAll({
      offset: skip,
      limit: limit,
      order: order,
      include: include,
      where: q,
      distinct: true
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
