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

import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { ChannelUser as ChannelUserInterface } from '@etherealengine/engine/src/schemas/interfaces/ChannelUser'
import { ChannelID } from '@etherealengine/engine/src/schemas/social/channel.schema'
import { UserID, UserType } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Paginated, Params } from '@feathersjs/feathers'
import { Application } from '../../../declarations'

export type ChannelUserDataType = ChannelUserInterface

export type RemoveParams = Params<{
  userId: UserID
  channelId: ChannelID
}> & {
  user?: UserType // loggedInUser
  isInternal?: boolean
}

/**
 * A class for Channel user service
 */
export class ChannelUser<T = ChannelUserDataType> extends Service<T> {
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  async remove(id: string | null, params?: RemoveParams): Promise<T> {
    const loggedInUser = params!.user
    if (!loggedInUser) {
      return super.remove(id, params) as Promise<T>
    }

    if (id) {
      throw new Error('Can only remove via query')
    }

    // remove method that only allows a user removing the channel if the logged in user is the owner of the channel
    const loggedInChannelUser = (await this.find({
      query: {
        userId: loggedInUser.id,
        channelId: params!.query!.channelId
      }
    })) as Paginated<ChannelUserDataType>

    if (!loggedInChannelUser.data.length || !loggedInChannelUser.data[0].isOwner) {
      throw new Error('Only the owner of a channel can remove users')
    }

    // if no id is provided, remove all who match the userId and channelId
    const { userId, channelId } = params!.query!
    const channelUser = (await this.Model.findOne({
      where: {
        userId,
        channelId
      }
    })) as ChannelUserDataType

    if (!channelUser) {
      throw new Error('Channel user not found')
    }

    return super.remove(channelUser.id, params) as Promise<T>
  }
}
