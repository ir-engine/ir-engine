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

import { instancePath } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { ChannelUserType, channelUserPath } from '@etherealengine/engine/src/schemas/social/channel-user.schema'
import {
  ChannelData,
  ChannelID,
  ChannelPatch,
  ChannelQuery,
  ChannelType,
  channelPath
} from '@etherealengine/engine/src/schemas/social/channel.schema'
import { MessageType, messagePath } from '@etherealengine/engine/src/schemas/social/message.schema'
import { UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
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
    return await super._get(id, params)
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
      const existingChannel: ChannelType = await knexClient(channelPath)
        .select(`${channelPath}.*`)
        .leftJoin(channelUserPath, `${channelPath}.id`, '=', `${channelUserPath}.channelId`)
        .whereNull(`${channelPath}.instanceId`)
        .andWhere((builder) => {
          builder.whereIn(`${channelUserPath}.userId`, userIds)
        })
        .groupBy(`${channelPath}.id`)
        .havingRaw('count(*) = ?', [userIds.length])
        .first()

      if (existingChannel) {
        return existingChannel
      }
    }

    let dataWithoutExtras = data ? JSON.parse(JSON.stringify(data)) : {}

    if (users) delete dataWithoutExtras.users
    if (userId) delete dataWithoutExtras.userId

    const channel = await super._create({
      ...dataWithoutExtras,
      instanceId: data.instanceId ? data.instanceId : undefined,
      name: data.instanceId ? 'World ' + data.instanceId : ''
    })

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

    return channel
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
        delete params.query?.action
        return super._find(params)
      }

      const knexClient: Knex = this.app.get('knexClient')

      let allChannels: ChannelType[] = []

      if (query.instanceId) {
        allChannels = await knexClient
          .from(channelPath)
          .join(instancePath, `${instancePath}.id`, `${channelPath}.instanceId`)
          .where(`${instancePath}.id`, '=', query.instanceId)
          .andWhere(`${instancePath}.ended`, '=', false)
          .select(`${channelPath}.*`)
      } else {
        const channels = await knexClient
          .from(channelPath)
          .leftJoin(instancePath, `${instancePath}.id`, `${channelPath}.instanceId`)
          .where(`${instancePath}.ended`, '=', false)
          .orWhereNull(`${channelPath}.instanceId`)
          .select(`${channelPath}.*`)

        /** @todo figure out how to do this as part of the query */
        for (const channel of channels) {
          channel.channelUsers = (await this.app.service(channelUserPath).find({
            query: {
              channelId: channel.id
            },
            paginate: false
          })) as ChannelUserType[]
        }

        allChannels = channels.filter((channel) => {
          return channel.channelUsers.find((channelUser) => channelUser.userId === userId)
        })
      }

      for (const channel of allChannels) {
        const messages = (await this.app.service(messagePath).find({
          query: {
            channelId: channel.id,
            $limit: 20,
            $sort: {
              createdAt: -1
            }
          },
          user: loggedInUser
        })) as Paginated<MessageType>
        channel.messages = messages.data
      }

      return allChannels
    } catch (err) {
      logger.error(err, `Channel find failed: ${err.message}`)
      throw err
    }
  }

  async patch(id: ChannelID, data: ChannelPatch, params?: ChannelParams) {
    return await super._patch(id, data, params)
  }

  /** only allow logged in user to delete the channel if they are the owner */
  async remove(id: ChannelID, params?: ChannelParams) {
    const loggedInUser = params!.user
    if (!loggedInUser) return super._remove(id, params)

    const channelUser = (await this.app.service(channelUserPath).find({
      query: {
        channelId: id,
        userId: loggedInUser.id,
        isOwner: true
      }
    })) as Paginated<ChannelUserType>

    if (channelUser.total < 0) throw new Error('Must be owner to delete channel')

    return super._remove(id)
  }
}
