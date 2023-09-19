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

import { checkScope } from '@etherealengine/engine/src/common/functions/checkScope'

import { instancePath } from '@etherealengine/engine/src/schemas/networking/instance.schema'

import { ChannelUserType, channelUserPath } from '@etherealengine/engine/src/schemas/social/channel-user.schema'
import { MessageType, messagePath } from '@etherealengine/engine/src/schemas/social/message.schema'
import { UserID, UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Knex } from 'knex'
import { Op, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserParams } from '../../api/root-params'

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

    return channel as T
  }

  // @ts-ignore
  async create(data: ChannelCreateType, params?: UserParams) {
    const users = data.users

    const loggedInUser = params!.user
    const userId = loggedInUser?.id

    if (!data.instanceId && users?.length) {
      // get channel that contains the same users
      const userIds = users.filter(Boolean)
      if (userId) userIds.push(userId)

      const knexClient: Knex = this.app.get('knexClient')
      const existingChannel = await knexClient('channel')
        .select('channel.*')
        .leftJoin(channelUserPath, 'channel.id', '=', `${channelUserPath}.channelId`)
        .whereNull('channel.instanceId')
        .andWhere((builder) => {
          builder.whereIn(`${channelUserPath}.userId`, userIds)
        })
        .groupBy('channel.id')
        .havingRaw('count(*) = ?', [userIds.length])
        .first()

      if (existingChannel) {
        return existingChannel
      }
    }

    const channel = (await super.create({})) as ChannelDataType

    /** @todo ensure all users specified are friends of loggedInUser */

    if (userId) {
      await this.app.service(channelUserPath).create({
        channelId: channel.id as ChannelID,
        userId,
        isOwner: true
      })
    }

    if (users) {
      await Promise.all(
        users.map(async (user) =>
          this.app.service(channelUserPath).create({
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

      const admin = query.action === 'admin' && (await checkScope(loggedInUser, 'admin', 'admin'))

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

        const channels = await (this.app.service('channel') as any).Model.findAndCountAll({
          offset: skip,
          limit: limit,
          order: order
        })

        for (const channel of channels) {
          channel.channel_users = (await this.app.service(channelUserPath).find({
            query: {
              channelId: channel.id
            },
            paginate: false
          })) as ChannelUserType[]
        }

        return {
          skip: skip,
          limit: limit,
          total: channels.count,
          data: channels.rows
        }
      }

      if (query.instanceId) {
        const knexClient: Knex = this.app.get('knexClient')
        let channels = await knexClient
          .from('channel')
          .join(instancePath, `${instancePath}.id`, 'channel.instanceId')
          .where(`${instancePath}.id`, '=', query.instanceId)
          .andWhere(`${instancePath}.ended`, '=', false)
          .select()
          .options({ nestTables: true })

        channels = channels.map((item) => item.channel)

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

      const knexClient: Knex = this.app.get('knexClient')

      let allChannels = await knexClient
        .from('channel')
        .leftJoin(instancePath, `${instancePath}.id`, 'channel.instanceId')
        .where(`${instancePath}.ended`, '=', false)
        .orWhereNull('channel.instanceId')
        .select()
        .options({ nestTables: true })

      /** @todo figure out how to do this as part of the query */
      allChannels = allChannels.map((item) => item.channel)

      for (const channel of allChannels) {
        channel.channel_users = (await this.app.service(channelUserPath).find({
          query: {
            channelId: channel.id
          },
          paginate: false
        })) as ChannelUserType[]
      }

      allChannels = allChannels.filter((channel) => {
        return channel.channel_users.find((channelUser) => channelUser.userId === userId)
      })

      for (const channel of allChannels) {
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

    const channelUser = (await this.app.service(channelUserPath).find({
      query: {
        channelId: id,
        userId: loggedInUser.id,
        isOwner: true
      }
    })) as Paginated<ChannelUserType>

    if (!channelUser.data.length) throw new Error('Must be owner to delete channel')

    return super.remove(id)
  }
}
