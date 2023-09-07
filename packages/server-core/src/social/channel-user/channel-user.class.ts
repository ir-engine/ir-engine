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

import {
  ChannelUserData,
  ChannelUserPatch,
  ChannelUserQuery,
  ChannelUserType
} from '@etherealengine/engine/src/schemas/social/channel-user.schema'
import { Id, NullableId, Paginated, Params } from '@feathersjs/feathers'
import { KnexAdapter, KnexAdapterOptions } from '@feathersjs/knex'
import { Application } from '../../../declarations'
import { RootParams } from '../../api/root-params'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ChannelUserParams extends RootParams<ChannelUserQuery> {}

/**
 * A class for Channel user service
 */
export class ChannelUserService<
  T = ChannelUserType,
  ServiceParams extends Params = ChannelUserParams
> extends KnexAdapter<ChannelUserType, ChannelUserData, ChannelUserParams, ChannelUserPatch> {
  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
  }

  async create(data: ChannelUserData, params?: ChannelUserParams) {
    return super._create(data, params)
  }

  async get(id: Id, params?: ChannelUserParams) {
    return super._get(id, params)
  }

  async find(params?: ChannelUserParams) {
    return super._find(params)
  }

  async patch(id: NullableId, data: ChannelUserPatch, params?: ChannelUserParams) {
    return super._patch(id, data, params)
  }

  async remove(id: NullableId, params?: ChannelUserParams) {
    const loggedInUser = params!.user
    if (!loggedInUser) {
      return super._remove(id, params)
    }

    if (id) {
      throw new Error('Can only remove via query')
    }

    // remove method that only allows a user removing the channel if the logged in user is the owner of the channel
    const loggedInChannelUser = (await this._find({
      query: {
        userId: loggedInUser.id,
        channelId: params!.query!.channelId,
        $limit: 1
      }
    })) as Paginated<ChannelUserType>

    if (!loggedInChannelUser.data.length || !loggedInChannelUser.data[0].isOwner) {
      throw new Error('Only the owner of a channel can remove users')
    }

    // if no id is provided, remove all who match the userId and channelId
    const { userId, channelId } = params!.query!
    const channelUser = (await this._find({
      query: {
        userId: userId,
        channelId: channelId,
        $limit: 1
      }
    })) as Paginated<ChannelUserType>

    if (channelUser.data.length === 0) {
      throw new Error('Channel user not found')
    }

    return super._remove(channelUser.data[0].id, params)
  }
}
