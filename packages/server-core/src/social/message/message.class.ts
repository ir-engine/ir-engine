import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { Params } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'
import { Op } from 'sequelize'

export class Message extends Service {
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
  async create(data: any, params: Params): Promise<any> {
    let channel, channelId
    let userIdList = []
    const loggedInUser = extractLoggedInUserFromParams(params)
    const userId = loggedInUser?.userId
    const targetObjectId = data.targetObjectId
    const targetObjectType = data.targetObjectType
    const channelModel = (this.app.service('channel') as any).Model
    console.log(data)

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
      const targetParty = await this.app.service('party').get(targetObjectId)
      if (targetParty == null) {
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
      const partyUsers = await this.app.service('party-user').find({
        query: {
          partyId: targetObjectId
        }
      })
      userIdList = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
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
          $limit: 1000,
          instanceId: targetObjectId,
          action: 'layer-users'
        }
      })
      userIdList = (instanceUsers as any).data.map((instanceUser) => {
        return instanceUser.id
      })
    }

    const newMessage = await super.create({
      senderId: userId,
      channelId: channelId,
      text: data.text
    })

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
