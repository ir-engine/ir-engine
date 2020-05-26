export default function (options = {}) {
  return async (context: any): Promise<void> => {
    const { app } = context
    const senderId = context.result.senderId
    const messageStatusModel = app.service('message-status').Model
    const conversationModel = app.service('conversation').Model
    const partyUserModel = app.service('party-user').Model
    const groupUserModel = app.service('group-user').Model
    const conversation = await conversationModel.findOne({
      where: {
        id: context.result.conversationId
      }
    })
    const recipients: any = []
    if (conversation.type === 'party') {
      const partyUsers = await partyUserModel.findAll({
        where: {
          userId: { $not: senderId },
          partyId: conversation.partyId
        }
      })
      partyUsers.forEach((partyUser: any) => {
        recipients.push(partyUser.userId)
      })
    } else if (conversation.type === 'group') {
      const groupUsers = await groupUserModel.findAll({
        where: {
          userId: { $not: senderId },
          groupId: conversation.groupId
        }
      })
      groupUsers.forEach((groupUser: any) => {
        recipients.push(groupUser.userId)
      })
    } else {
      if (conversation.firstuserId === context.result.senderId) {
        recipients.push(conversation.seconduserId)
      } else {
        recipients.push(conversation.firstuserId)
      }
    }

    if (recipients.length) {
      recipients.forEach((recipientId: any) => {
        messageStatusModel.create({
          messageId: context.result.id,
          recipientId: recipientId
        })
      })
    }
    return context
  }
}
