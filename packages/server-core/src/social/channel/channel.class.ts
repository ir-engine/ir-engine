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

import { ChannelUser } from '@etherealengine/engine/src/schemas/interfaces/ChannelUser'
import {
  ChannelData,
  ChannelID,
  ChannelQuery,
  ChannelType,
  channelPath
} from '@etherealengine/engine/src/schemas/social/channel.schema'
import { MessageType, messagePath } from '@etherealengine/engine/src/schemas/social/message.schema'
import { UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { KnexAdapter, KnexAdapterOptions } from '@feathersjs/knex'
import { Knex } from 'knex'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { RootParams } from '../../api/root-params'
import { checkScope } from '../../hooks/verify-scope'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ChannelParams extends RootParams<ChannelQuery> {}

export class ChannelService<T = ChannelType, ServiceParams extends Params = ChannelParams> extends KnexAdapter<
  ChannelType,
  ChannelData,
  ChannelParams
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: ChannelID, params?: ChannelParams) {
    const channel = await super._get(id, params)

    // TODO: Populating ChannelUser's sender property here manually. Once channel-user service is moved to feathers 5. This should be part of its resolver.
    if (channel.channelUsers && channel.channelUsers.length > 0) {
      for (const channelUser of channel.channelUsers) {
        channelUser.user = await this.app.service(userPath)._get(channelUser.userId)
      }
    }

    return channel
  }

  // @ts-ignore
  async create(data: ChannelData, params?: ChannelParams) {
    const users = data.users

    const loggedInUser = params!.user
    const userId = loggedInUser?.id

    if (!data.instanceId && users?.length) {
      // get channel that contains the same users
      const userIds = users.filter(Boolean)
      if (userId) userIds.push(userId)

      const knexClient: Knex = this.app.get('knexClient')
      const existingChannel = await knexClient(channelPath)
        .select(`${channelPath}.*`)
        .leftJoin('channel-user', `${channelPath}.id`, '=', `channel-user.channelId`)
        .whereNull(`${channelPath}.instanceId`)
        .andWhere((builder) => {
          builder.whereIn(`channel-user.userId`, userIds)
        })
        .groupBy(`${channelPath}.id`)
        .havingRaw('count(*) = ?', [userIds.length])
        .first()

      if (existingChannel) {
        return existingChannel
      }
    }

    const channel = await super._create({})

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

    return super._get(channel.id)
  }

  /**
   * A method which find channel and display it
   *
   * @param params of query which contains items limit and numberr skip
   * @returns {@Array} which contains list of channel
   */

  async find(params?: ChannelParams) {
    try {
      if (!params) params = {}
      const query = params.query!

      const loggedInUser = params!.user as UserType
      const userId = loggedInUser?.id

      if (!userId) return []

      const admin = query.action === 'admin' && (await checkScope(loggedInUser, this.app, 'admin', 'admin'))

      if (admin) {
        return super._find(params)
      }

      if (query.instanceId) {
        const knexClient: Knex = this.app.get('knexClient')
        let channels = await knexClient
          .from(`${channelPath}`)
          .join('instance', `instance.id`, `${channelPath}.instanceId`)
          .where(`instance.id`, '=', query.instanceId)
          .andWhere('instance.ended', '=', false)
          .select()
          .options({ nestTables: true })

        channels = channels.map((item) => item.channel)

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

      const knexClient: Knex = this.app.get('knexClient')

      let allChannels = await knexClient
        .from(`${channelPath}`)
        .leftJoin('instance', `instance.id`, `${channelPath}.instanceId`)
        .where(`instance.ended`, '=', false)
        .orWhereNull(`${channelPath}.instanceId`)
        .select()
        .options({ nestTables: true })

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
  async remove(id: ChannelID, params?: ChannelParams) {
    const loggedInUser = params!.user
    if (!loggedInUser) return super._remove(id, params)

    //TODO: update this once channel-user gets migrated to feathers 5
    const channelUser = (await this.app.service('channel-user').find({
      query: {
        channelId: id,
        userId: loggedInUser.id,
        isOwner: true
      }
    })) as Paginated<ChannelUser>

    if (!channelUser.data.length) throw new Error('Must be owner to delete channel')

    return super._remove(id)
  }
}
