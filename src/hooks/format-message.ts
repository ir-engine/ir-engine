export default function (options = {}) {
  return async (context: any): Promise<void> => {
    const { app } = context
    const conversationModel = app.service('conversation').Model
    const messageModel = app.service('message').Model
    const messageStatusModel = app.service('message-status').Model
    const conversation = await conversationModel.findOne({
      where: {
        id: context.result.conversationId
      }
    })
    const message = await messageModel.findOne({
      where: {
        id: context.result.id
      },
      includes: [
        {
          model: messageStatusModel
        }
      ]
    })

    context.result = {
      message: message,
      conversation: conversation
    }

    return context
  }
}
