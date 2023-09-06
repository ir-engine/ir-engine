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

import { Channel as ChannelInterface } from '@etherealengine/engine/src/schemas/interfaces/Channel'

import { ChannelID } from '@etherealengine/common/src/dbmodels/Channel'
import { ChannelUser } from '@etherealengine/engine/src/schemas/interfaces/ChannelUser'
import { MessageType, messagePath } from '@etherealengine/engine/src/schemas/social/message.schema'
import { UserID, UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Op, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserParams } from '../../api/root-params'
import { checkScope } from '../../hooks/verify-scope'

export type ChannelDataType = ChannelInterface

export type ChannelCreateType = {
  users?: UserID[]
  userId?: UserID
  instanceId?: string // InstanceID
}

export class Channel<T = ChannelDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: ChannelID, params?: UserParams) {
    const channel = (await super.get(id, params)) as ChannelDataType

    // TODO: Populating ChannelUser's sender property here manually. Once channel-user service is moved to feathers 5. This should be part of its resolver.
    if (channel.channel_users && channel.channel_users.length > 0) {
      for (const channelUser of channel.channel_users) {
        channelUser.user = await this.app.service(userPath)._get(channelUser.userId)
      }
    }

    // TODO: Populating Message's sender property here manually. Once channel service is moved to feathers 5. This should be part of its resolver.
    for (const message of channel.messages) {
      if (message && message.senderId && !message.sender) {
        message.sender = await this.app.service(userPath)._get(message.senderId)
      }
    }

    return channel as T
  }

  // @ts-ignore
  async create(data: ChannelCreateType, params?: UserParams) {
    const users = data.users

    const loggedInUser = params!.user
    const userId = loggedInUser?.id

    if (!data.instanceId && users?.length) {
      // get channel that contains the same users
      const existingChannel = (await this.app.service('channel').Model.findOne({
        where: {
          instanceId: null
        },
        include: [
          {
            model: this.app.service('channel-user').Model,
            required: true,
            as: 'channel_users',
            where: {
              [Op.and]: [userId, ...users].filter(Boolean).map((user) => ({ userId: user }))
            }
          }
        ]
      })) as ChannelDataType | null
      if (existingChannel) {
        return existingChannel
      }
    }

    const channel = (await super.create({})) as ChannelDataType

    /** @todo ensure all users specified are friends of loggedInUser */

    if (userId) {
      await this.app.service('channel-user').create({
        channelId: channel.id as ChannelID,
        userId,
        isOwner: true
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
      await super.patch(channel.id, { instanceId: data.instanceId, name: 'World ' + data.instanceId })
    } else {
      // @ts-ignore
      await super.patch(channel.id, { name: '' })
    }

    return this.app.service('channel').get(channel.id)
  }

  /**
   * A method which find channel and display it
   *
   * @param params of query which contains items limit and numberr skip
   * @returns {@Array} which contains list of channel
   */

  async find(params?: UserParams): Promise<T[] | Paginated<T>> {
    try {
      if (!params) params = {}
      const query = params.query!

      const loggedInUser = params!.user as UserType
      const userId = loggedInUser?.id

      if (!userId) return []

      const admin = query.action === 'admin' && (await checkScope(loggedInUser, this.app, 'admin', 'admin'))

      if (admin) {
        const { action, $skip, $limit, search, ...query } = params?.query ?? {}
        const skip = $skip ? $skip : 0
        const limit = $limit ? $limit : 10

        const sort = params?.query?.$sort
        delete query.$sort
        const order: any[] = []
        if (sort != null) {
          Object.keys(sort).forEach((name, val) => {
            const item: any[] = []

            if (name === 'instance') {
              //item.push(this.app.service('instance').Model)
              item.push(Sequelize.literal('`instance.ipAddress`'))
            } else {
              item.push(name)
            }
            item.push(sort[name] === 0 ? 'DESC' : 'ASC')

            order.push(item)
          })
        }
        let ip = {}
        let name = {}
        if (!isNaN(search)) {
          ip = search ? { ipAddress: { [Op.like]: `%${search}%` } } : {}
        } else {
          name = search ? { name: { [Op.like]: `%${search}%` } } : {}
        }

        const channel = await (this.app.service('channel') as any).Model.findAndCountAll({
          offset: skip,
          limit: limit,
          order: order,
          include: [
            {
              model: (this.app.service('channel-user') as any).Model
            }
          ]
        })

        return {
          skip: skip,
          limit: limit,
          total: channel.count,
          data: channel.rows
        }
      }

      if (query.instanceId) {
        const channels = await this.app.service('channel').Model.findAll({
          include: [
            {
              model: this.app.service('instance').Model,
              required: true,
              where: {
                id: query.instanceId,
                ended: false
              },
              include: [
                /** @todo - couldn't figure out how to include active users */
                // {
                //   model: this.app.service(userPath).Model,
                // },
              ]
            }
          ]
        })

        // TODO: Populating Message's sender property here manually. Once message service is moved to feathers 5. This should be part of its resolver.
        for (const channel of channels) {
          channel.messages = (await this.app.service(messagePath).find({
            query: {
              channelId: channel.id,
              $limit: 20,
              $sort: {
                createdAt: -1
              }
            },
            user: loggedInUser
          })) as Paginated<MessageType>
        }

        return channels

        // return channels.filter((channel) => {
        //   return channel.instance.id === query.instanceId // && channel.instance.users.find((user) => user.id === userId)
        // })
      }

      let allChannels = await this.app.service('channel').Model.findAll({
        where: {
          [Op.or]: [
            {
              '$instance.ended$': false
            },
            {
              instanceId: null
            }
          ]
        },
        include: [
          {
            model: this.app.service('channel-user').Model
          },
          {
            model: this.app.service('instance').Model
          }
        ]
      })

      /** @todo figure out how to do this as part of the query */

      allChannels = allChannels.filter((channel) => {
        return channel.channel_users.find((channelUser) => channelUser.userId === userId)
      })

      for (const channel of allChannels) {
        // TODO: Populating ChannelUser's sender property here manually. Once channel-user service is moved to feathers 5. This should be part of its resolver.
        if (channel.dataValues.channel_users && channel.dataValues.channel_users.length > 0) {
          for (const channelUser of channel.dataValues.channel_users) {
            channelUser.user = await this.app.service(userPath)._get(channelUser.userId)
          }
        }
        channel.messages = (await this.app.service(messagePath).find({
          query: {
            channelId: channel.id,
            $limit: 20,
            $sort: {
              createdAt: -1
            }
          },
          user: loggedInUser
        })) as Paginated<MessageType>
      }

      return allChannels
    } catch (err) {
      logger.error(err, `Channel find failed: ${err.message}`)
      throw err
    }
  }

  /** only allow logged in user to delete the channel if they are the owner */
  async remove(id: ChannelID, params?: UserParams) {
    const loggedInUser = params!.user
    if (!loggedInUser) return super.remove(id, params)

    const channelUser = (await this.app.service('channel-user').find({
      query: {
        channelId: id,
        userId: loggedInUser.id,
        isOwner: true
      }
    })) as Paginated<ChannelUser>

    if (!channelUser.data.length) throw new Error('Must be owner to delete channel')

    return super.remove(id)
  }
}
