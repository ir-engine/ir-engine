export default function (options = {}) {
  return async (context: any) => {
    const { app, params, result } = context
    const partyUserModel = app.service('party-user').Model
    const conversationModel = app.service('conversation').Model
    const userId = params.connection['identity-provider'].userId
    const partyId = result.id
    await partyUserModel.create({
      userId: userId,
      partyId: partyId,
      isOwner: true
    })

    const conversation = await conversationModel.create({
      partyId: partyId,
      type: 'party',
      status: true
    })
    context.result.conversation = conversation
    return context
  }
}
