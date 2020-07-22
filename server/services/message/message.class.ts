import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'
import { Params } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'

export class Message extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create (data: any, params: Params): Promise<any> {
    let channelId
    let userIdList = []
    const { query } = params
    const loggedInUser = extractLoggedInUserFromParams(params)
    const userId = loggedInUser.userId

    const targetObjectId = data.targetObjectId
    const targetObjectType = data.targetObjectType

    if (targetObjectType === 'user') {
      const targetUser = await this.app.service('user').get(targetObjectId)
      if (targetUser == null) {
        throw new BadRequest('Invalid target user ID')
      }
      const channel = await this.app.service('channel').find({
        query: {
          $or: [
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
      if ((channel as any).total === 0) {
        const newChannel = await this.app.service('channel').create({
          channelType: 'user',
          userId1: userId,
          userId2: targetObjectId
        })
        channelId = newChannel.id
      }
      else {
        channelId = (channel as any).data[0].id
      }
      userIdList = [userId, targetObjectId]
    }
    else if (targetObjectType === 'group') {
      const targetGroup = await this.app.service('group').get(targetObjectId)
      if (targetGroup == null) {
        throw new BadRequest('Invalid target group ID')
      }
      const channel = await this.app.service('channel').find({
        query: {
          groupId: targetObjectId
        }
      })
      if ((channel as any).total === 0) {
        const newChannel = await this.app.service('channel').create({
          channelType: 'group',
          groupId: targetObjectId
        })
        channelId = newChannel.id
      }
      else {
        channelId = (channel as any).data[0].id
      }
      const groupUsers = await this.app.service('group-user').find({
        query: {
          groupId: targetObjectId
        }
      })
      userIdList = (groupUsers as any).data.map((groupUser) => {
        return groupUser.id
      })
    }
    else if (targetObjectType === 'party') {
      const targetParty = await this.app.service('party').get(targetObjectId)
      if (targetParty == null) {
        throw new BadRequest('Invalid target party ID')
      }
      const channel = await this.app.service('channel').find({
        query: {
          partyId: targetObjectId
        }
      })
      if ((channel as any).total === 0) {
        const newChannel = await this.app.service('channel').create({
          channelType: 'group',
          groupId: targetObjectId
        })
        channelId = newChannel.id
      }
      else {
        channelId = (channel as any).data[0].id
      }
      const partyUsers = await this.app.service('party-user').find({
        query: {
          partyId: targetObjectId
        }
      })
      userIdList = (partyUsers as any).data.map((partyUser) => {
        return partyUser.id
      })
    }

    const newMessage = await super.create({
      senderId: userId,
      channelId: channelId,
      text: data.text
    })

    await Promise.all(userIdList.map((mappedUserId: string) => {
      return this.app.service('message-status').create({
        userId: mappedUserId,
        messageId: newMessage.id,
        status: userId === mappedUserId ? 'unread' : 'read'
      })
    }))

    return newMessage
  }
}
