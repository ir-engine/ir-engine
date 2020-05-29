import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { NullableId, Params } from '@feathersjs/feathers'

export class Conversation extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async update (id: NullableId, data: any, params?: Params | undefined): Promise<any> {
    const conversationModel = this.app.service('conversation').Model
    const conversation = await conversationModel.findOne({
      where: {
        id: data.conversationId,
        seconduserId: data.userId
      }
    })
    if (conversation) {
      if (data.action) {
        await conversation.update({ status: true })
        await this.notifyUserAcceptance(conversation.id)
      } else {
        conversationModel.destroy()
      }
    } else {
      throw new Error('Friend request not found.')
    }

    return true
  }

  private async notifyUserAcceptance (conversationId: any): Promise<any> {
    const conversationModel = this.app.service('conversation').Model
    const messageModel = this.app.service('message').Model
    const messageStatusModel = this.app.service('message-status').Model
    const userModel = this.app.service('user').Model
    const conversation = await conversationModel.findOne({
      where: {
        id: conversationId
      },
      attributes: ['id', 'type'],
      include: [
        {
          model: messageModel,
          attributes: ['id', 'text', 'senderId', 'createdAt', 'isDelivered', 'isRead'],
          separate: true,
          order: [['id', 'desc']],
          limit: 20,
          offset: 0,
          include: [
            {
              model: messageStatusModel,
              attributes: ['id', 'recipientId', 'isRead', 'isDelivered']
            }
          ]
        },
        {
          model: userModel,
          attributes: ['id', 'name'],
          as: 'firstuser'
        },
        {
          model: userModel,
          attributes: ['id', 'name'],
          as: 'seconduser'
        }
      ]
    })
    this.app.service('chatroom').emit('conversation', {
      type: 'friend_request_accepted',
      conversation: conversation
    })
  }
}
