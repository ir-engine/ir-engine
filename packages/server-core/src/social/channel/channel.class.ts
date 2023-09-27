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

import { Params } from '@feathersjs/feathers'

import { channelUserPath } from '@etherealengine/engine/src/schemas/social/channel-user.schema'
import {
  ChannelData,
  ChannelID,
  ChannelPatch,
  ChannelQuery,
  ChannelType,
  channelPath
} from '@etherealengine/engine/src/schemas/social/channel.schema'
import { KnexAdapter, KnexAdapterOptions } from '@feathersjs/knex'
import { Knex } from 'knex'
import { Application } from '../../../declarations'
import { RootParams } from '../../api/root-params'

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

    const dataWithoutExtras = data ? JSON.parse(JSON.stringify(data)) : {}

    if (users) delete dataWithoutExtras.users
    if (userId) delete dataWithoutExtras.userId

    const channel = await super._create({
      ...dataWithoutExtras,
      instanceId: data.instanceId ? data.instanceId : undefined,
      name: data.instanceId ? 'World ' + data.instanceId : data.name || ''
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
    return super._find(params)
  }

  async patch(id: ChannelID, data: ChannelPatch, params?: ChannelParams) {
    return await super._patch(id, data, params)
  }

  /** only allow logged in user to delete the channel if they are the owner */
  async remove(id: ChannelID, params?: ChannelParams) {
    return super._remove(id)
  }
}
