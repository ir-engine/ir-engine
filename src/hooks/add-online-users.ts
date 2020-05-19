export default function (options = {}) {
  return async (context: any): Promise<void> => {
    const { app } = context
    const conversations = context.result
    context.result = {}
    context.result.conversation = conversations
    context.result.onlineUsers = []
    const users: any[] = []
    conversations.forEach((cnvrs: any) => {
      users.push(cnvrs.firstuser.id)
      users.push(cnvrs.seconduser.id)
    })
    app.channel('authenticated').connections.forEach((conn: any) => {
      if (users.includes(conn['identity-provider'].userId)) {
        context.result.onlineUsers.push(conn['identity-provider'].userId)
      }
    })

    return context
  }
}
