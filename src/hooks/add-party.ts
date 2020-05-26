export default function (options = {}) {
  return async (context: any): Promise<void> => {
    const { app, params } = context
    const partyModel = app.service('party').Model
    const partyUserModel = app.service('party-user').Model
    const userModel = app.service('user').Model
    const messageModel = app.service('message').Model
    const messageStatusModel = app.service('message-status').Model
    const conversationModel = app.service('conversation').Model
    const userParties = await partyUserModel.findAll({
      where: {
        userId: params.connection['identity-provider'].userId
      },
      attributes: [],
      include: [
        {
          model: partyModel,
          include: [
            {
              model: userModel,
              attributes: ['id', 'name']
            },
            {
              model: conversationModel,
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
                }
              ]
            }
          ]
        }
      ]
    })
    context.result.userParty = userParties
    return context
  }
}
