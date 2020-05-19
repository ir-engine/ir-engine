import { Op } from 'sequelize'

export default function (options = {}) {
  return async (context: any): Promise<void> => {
    const { app } = context
    const messageStatusModel = app.service('message-status').Model
    const conversationModel = app.service('conversation').Model
    const userModel = app.service('user').Model
    const conversation = await conversationModel.findOne({
      where: {
        id: context.result.conversationId
      }
    })
    let recipientId
    if (conversation) {
      recipientId = conversation.firstuserId === context.result.senderId ? conversation.seconduserId : conversation.firstuserId
    }

    messageStatusModel.create({
      messageId: context.result.id,
      recipientId: recipientId
    })
    const users = await userModel.findAll({
      where: {
        id: {
          [Op.in]: [conversation.firstuserId, conversation.seconduserId]
        }
      },
      attributes: ['id', 'name']
    })

    const data = {
      conversation: {
        id: conversation.id,
        users: users,
        message: [
          context.result
        ]
      }
    }

    context.result = data

    return context
  }
}
