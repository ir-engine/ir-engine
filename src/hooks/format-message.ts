export default (options = {}) => {
  return async (context: any): Promise<void> => {
    const data = context.data
    data.sender = context.params['identity-provider'].userId
    data.receiver = context.params['identity-provider'].userId
    context.data = data
    return context
  }
}
