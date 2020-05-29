export default function (options = {}) {
  return async (context: any) => {
    const { app, params, result } = context
    const groupUserModel = app.service('group-user').Model
    const groupUserRankModel = app.service('group-user-rank').Model
    const conversationModel = app.service('conversation').Model
    const userId = params.connection['identity-provider'].userId
    const groupId = result.id
    const groupUserRank = 'admin'
    await groupUserRankModel.create({
      groupId: groupId,
      rank: groupUserRank
    })
    await groupUserModel.create({
      userId: userId,
      groupId: groupId,
      groupUserRank: groupUserRank
    })

    const conversation = await conversationModel.create({
      groupId: groupId,
      type: 'group',
      status: true
    })

    context.result.conversation = conversation
    return context
  }
}
