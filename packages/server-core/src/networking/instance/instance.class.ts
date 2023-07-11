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

import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import Sequelize, { Op } from 'sequelize'

import { Instance as InstanceInterface } from '@etherealengine/common/src/interfaces/Instance'

import { Application } from '../../../declarations'

export type InstanceDataType = InstanceInterface

const roomCodeCharacters = '123456789'

const generateRoomCode = () => {
  let code = ''
  for (let i = 0; i < 6; i++) code += roomCodeCharacters.charAt(Math.floor(Math.random() * roomCodeCharacters.length))
  return code
}

/**
 * A class for Intance service
 */
export class Instance<T = InstanceDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
  /**
   * A method which searches for instances
   *
   * @param params of query with an acton or user role
   * @returns user object
   */
  async find(params?: Params): Promise<T[] | Paginated<T>> {
    const action = params?.query?.action
    const search = params?.query?.search
    const skip = params?.query?.$skip ? params.query.$skip : 0
    const limit = params?.query?.$limit ? params.query.$limit : 10
    const sort = params?.query?.$sort
    if (action === 'admin') {
      //TODO: uncomment here
      // const loggedInUser = params.user as UserInterface
      // const user = await super.get(loggedInUser.userId);
      // console.log(user);
      // if (user.userRole !== 'admin') throw new Forbidden ('Must be system admin to execute this action');
      let ip = {}
      let name = {}
      if (!isNaN(search)) {
        ip = search ? { ipAddress: { [Op.like]: `%${search}%` } } : {}
      } else {
        name = search ? { name: { [Op.like]: `%${search}%` } } : {}
      }
      const order: any[] = []
      if (sort != null)
        Object.keys(sort).forEach((name, val) => {
          if (name === 'locationId') {
            order.push([Sequelize.literal('`location.name`'), sort[name] === 0 ? 'DESC' : 'ASC'])
          } else {
            order.push([name, sort[name] === 0 ? 'DESC' : 'ASC'])
          }
        })
      const foundLocation = await this.app.service('instance').Model.findAndCountAll({
        offset: skip,
        limit: limit,
        include: {
          model: this.app.service('location').Model,
          required: true,
          where: { ...name }
        },
        nest: false,
        where: { ended: false, ...ip }
      })

      return {
        skip: skip,
        limit: limit,
        total: foundLocation.count,
        data: foundLocation.rows
      }
    } else {
      return super.find(params)
    }
  }

  /**
   * A method which creates an instance
   *
   * @param data of new instance
   * @param params of query
   * @returns instance object
   */
  async create(data: any, params?: Params): Promise<T | T[]> {
    let existingInstances = ''

    do {
      data.roomCode = generateRoomCode()
      existingInstances = await this.app.service('instance').Model.count({
        where: {
          roomCode: data.roomCode,
          ended: false
        }
      })
    } while (existingInstances === '0')

    return super.create(data)
  }
}
