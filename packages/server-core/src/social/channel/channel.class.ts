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

import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import _ from 'lodash'
import { Op } from 'sequelize'

import { Channel as ChannelInterface } from '@etherealengine/common/src/interfaces/Channel'
import { ChannelID } from '@etherealengine/common/src/interfaces/ChannelUser'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserParams } from '../../user/user/user.class'

export type ChannelDataType = ChannelInterface

export type ChannelCreateType = {
  users?: UserId[]
  userId?: UserId
  instanceId?: string // InstanceID
}

export class Channel<T = ChannelDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // @ts-ignore
  async create(data: ChannelCreateType, params?: UserParams) {
    const users = data.users
    const channel = (await super.create({})) as ChannelDataType

    const loggedInUser = params!.user as UserInterface
    const userId = loggedInUser.id

    if (userId) {
      await this.app.service('channel-user').create({
        channelId: channel.id as ChannelID,
        userId
      })
    }

    if (users) {
      await Promise.all(
        users.map(async (user) =>
          this.app.service('channel-user').create({
            channelId: channel.id as ChannelID,
            userId: user
          })
        )
      )
    }

    if (data.instanceId) {
      // @ts-ignore
      await super.patch(channel.id, { instanceId: data.instanceId })
    }

    const channelWithUsers = await this.app.service('channel').get(channel.id, {
      include: [
        {
          model: this.app.service('channel-user').Model,
          include: [
            {
              model: this.app.service('user').Model
            }
          ]
        },
        {
          model: this.app.service('instance').Model,
          include: [
            {
              model: this.app.service('location').Model
            }
          ]
        }
      ]
    })

    return channelWithUsers
  }

  /**
   * A method which find channel and display it
   *
   * @param params of query which contains items limit and numberr skip
   * @returns {@Array} which contains list of channel
   */

  async find(params?: UserParams): Promise<T[] | Paginated<T>> {
    if (!params) params = {}
    const query = params.query!
    const loggedInUser = params!.user as UserInterface
    const userId = loggedInUser.id
    if (!userId) return []

    console.log()

    try {
      if (query.instanceId) {
        const channels = await this.app.service('channel').Model.findAll({
          include: [
            {
              model: this.app.service('instance').Model,
              required: true,
              where: {
                ended: false
              },
              include: [
                /** @todo - couldn't figure out how to include active users */
                // {
                //   model: this.app.service('user').Model,
                // },
              ]
            },
            {
              model: this.app.service('message').Model,
              limit: 20,
              order: [['createdAt', 'DESC']],
              include: [
                {
                  model: this.app.service('user').Model,
                  as: 'sender'
                }
              ]
            }
          ]
        })

        return channels.filter((channel) => {
          return channel.instance.id === query.instanceId // && channel.instance.users.find((user) => user.id === userId)
        })
      }

      return this.app.service('channel').Model.findAll({
        include: [
          {
            model: this.app.service('channel-user').Model,
            required: true,
            where: { userId },
            include: [
              {
                model: this.app.service('user').Model
              }
            ]
          },
          {
            model: this.app.service('message').Model,
            limit: 20,
            order: [['createdAt', 'DESC']],
            include: [
              {
                model: this.app.service('user').Model,
                as: 'sender'
              }
            ]
          }
        ]
      })
    } catch (err) {
      logger.error(err, `Channel find failed: ${err.message}`)
      throw err
    }
  }
}
