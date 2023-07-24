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
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { Message as MessageInterface } from '@etherealengine/common/src/interfaces/Message'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import { UserParams } from '../../user/user/user.class'

export interface MessageParams extends UserParams {
  'identity-provider': {
    userId: string
  }
}

export type MessageDataType = MessageInterface

export class Message<T = MessageDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
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
  async create(data: any, params?: MessageParams): Promise<T> {
    let channel, channelId
    let userIdList: any[] = []
    const loggedInUser = params!.user as UserInterface
    const userId = loggedInUser?.id
    const targetObjectId = data.targetObjectId
    const targetObjectType = data.targetObjectType
    const channelModel = this.app.service('channel').Model

    if (targetObjectType === 'user') {
      const targetUser = await this.app.service('user').get(targetObjectId)
      if (targetUser == null) {
        throw new BadRequest('Invalid target user ID')
      }
      channel = await channelModel.findOne({
        where: {
          [Op.or]: [
            {
              userId1: userId,
              userId2: targetObjectId
            },
            {
              userId2: userId,
              userId1: targetObjectId
            }
          ]
        }
      })
      if (channel == null) {
        channel = await this.app.service('channel').create({
          channelType: 'user',
          userId1: userId,
          userId2: targetObjectId
        })
      }
      channelId = channel.id
      userIdList = [userId, targetObjectId]
    } else if (targetObjectType === 'group') {
      const targetGroup = await this.app.service('group').get(targetObjectId)
      if (targetGroup == null) {
        throw new BadRequest('Invalid target group ID')
      }
      channel = await channelModel.findOne({
        where: {
          groupId: targetObjectId
        }
      })
      if (channel == null) {
        channel = await this.app.service('channel').create({
          channelType: 'group',
          groupId: targetObjectId
        })
      }
      channelId = channel.id
      const groupUsers = await this.app.service('group-user').find({
        query: {
          groupId: targetObjectId
        }
      })
      userIdList = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
    } else if (targetObjectType === 'party') {
      const targetParty = await this.app.service('party').Model.count({ where: { id: targetObjectId } })
      if (targetParty <= 0) {
        throw new BadRequest('Invalid target party ID')
      }
      channel = await channelModel.findOne({
        where: {
          partyId: targetObjectId
        }
      })
      if (channel == null) {
        channel = await this.app.service('channel').create({
          channelType: 'party',
          partyId: targetObjectId
        })
      }
      channelId = channel.id
      const partyUsers = await this.app.service('party-user').Model.findAll({ where: { partyId: targetObjectId } })
      userIdList = partyUsers.map((partyUser) => partyUser.userId)
    } else if (targetObjectType === 'instance') {
      const targetInstance = await this.app.service('instance').get(targetObjectId)
      if (targetInstance == null) {
        throw new BadRequest('Invalid target instance ID')
      }
      channel = await channelModel.findOne({
        where: {
          instanceId: targetObjectId
        }
      })
      if (channel == null) {
        channel = await this.app.service('channel').create({
          channelType: 'instance',
          instanceId: targetObjectId
        })
      }
      channelId = channel.id
      const instanceUsers = await this.app.service('user').find({
        query: {
          $limit: 1000
        },
        sequelize: {
          include: [
            {
              model: this.app.service('instance-attendance').Model,
              as: 'instanceAttendance',
              where: {
                instanceId: targetObjectId
              }
            }
          ]
        }
      })
      userIdList = (instanceUsers as any).data.map((instanceUser) => {
        return instanceUser.id
      })
    }

    const messageData: any = {
      senderId: userId,
      channelId: channelId,
      text: data.text,
      isNotification: data.isNotification
    }
    const newMessage: any = await super.create({ ...messageData })
    newMessage.sender = loggedInUser

    await Promise.all(
      userIdList.map((mappedUserId: string) => {
        return this.app.service('message-status').create({
          userId: mappedUserId,
          messageId: newMessage.id,
          status: userId === mappedUserId ? 'read' : 'unread'
        })
      })
    )

    await this.app.service('channel').patch(channelId, {
      channelType: channel.channelType
    })

    return newMessage
  }
}
