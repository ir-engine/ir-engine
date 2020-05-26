export default function (options = {}) {
  return async (context: any): Promise<void> => {
    const { app } = context
    const conversations = context.result
    context.result = {}
    context.result.conversation = conversations
    context.result.onlineUsers = []
    const users: any[] = []
    conversations.forEach((cnvrs: any) => {
      if (cnvrs.firstuser) {
        users.push(cnvrs.firstuser.id)
      }
      if (cnvrs.seconduser.id) {
        users.push(cnvrs.seconduser.id)
      }
    })
    app.channel('authenticated').connections.forEach((conn: any) => {
      if (users.includes(conn['identity-provider'].userId) &&
      !context.result.onlineUsers.includes(conn['identity-provider'].userId)) {
        context.result.onlineUsers.push(conn['identity-provider'].userId)
      }
    })
    return context
  }
}
