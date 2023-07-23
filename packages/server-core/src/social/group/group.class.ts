/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Paginated } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { Group as GroupInterface } from '@etherealengine/common/src/interfaces/Group'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'

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
   * Return groups and their users
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
          group.dataValues.groupUsers = await (this.app.service('group-user') as any).Model.findAll({
            where: {
              groupId: group.id
            },
            include: [
              {
                model: (this.app.service('user') as any).Model
              }
            ]
          })
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
