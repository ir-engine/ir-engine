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

import { instanceAttendancePath } from '@etherealengine/engine/src/schemas/networking/instance-attendance.schema'
import { instancePath } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { ChannelType, channelPath } from '@etherealengine/engine/src/schemas/social/channel.schema'
import {
  MessageData,
  MessagePatch,
  MessageQuery,
  MessageType
} from '@etherealengine/engine/src/schemas/social/message.schema'
import { UserID, UserType, userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { BadRequest } from '@feathersjs/errors'
import { Paginated, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'
import { Knex } from 'knex'
import { Application } from '../../../declarations'
import { RootParams } from '../../api/root-params'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MessageParams extends RootParams<MessageQuery> {
  'identity-provider'?: {
    userId: UserID
  }
}

/**
 * A class for Message service
 */

export class MessageService<T = MessageType, ServiceParams extends Params = MessageParams> extends KnexAdapter<
  MessageType,
  MessageData,
  MessageParams,
  MessagePatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * A function which is used to create a message
   *
   * @param data for new message
   * @param params contain user info
   * @returns {@Object} created message
   */
  // @ts-ignore
  async create(data: MessageData, params?: MessageParams) {
    let channel: ChannelType | null = null
    let userIdList: any[] = []
    const loggedInUser = params!.user as UserType
    const userId = loggedInUser?.id
    const givenChannelId = data.channelId
    const instanceId = data.instanceId

    if (givenChannelId) channel = await this.app.service(channelPath).get(givenChannelId)

    if (!channel) {
      if (instanceId) {
        const targetInstance = await this.app.service(instancePath)._get(instanceId)
        if (targetInstance == null) {
          throw new BadRequest('Invalid target instance ID')
        }
        const channelResult = (await this.app.service(channelPath)._find({
          query: {
            instanceId,
            $limit: 1
          }
        })) as Paginated<ChannelType>

        if (channelResult.total === 0) {
          channel = await this.app.service(channelPath).create({
            instanceId
          })
        } else {
          channel = channelResult.data[0]
        }

        const knexClient: Knex = this.app.get('knexClient')

        const instanceUsers = await knexClient
          .from(userPath)
          .join(instanceAttendancePath, `${instanceAttendancePath}.userId`, `${userPath}.id`)
          .where(`${instanceAttendancePath}.instanceId`, instanceId)
          .limit(1000)
          .select()
          .options({ nestTables: true })

        userIdList = instanceUsers.map((instanceUser) => instanceUser.user.id)
      }
    }
    if (!channel) throw new BadRequest('Could not find or create channel')

    delete data.instanceId
    const messageData = {
      ...data,
      senderId: userId,
      channelId: channel.id
    }
    const newMessage = await super._create(messageData)
    newMessage.sender = loggedInUser

    return newMessage
  }

  async find(params?: MessageParams) {
    return await super._find(params)
  }
}
