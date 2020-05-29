import { Hook, HookContext } from '@feathersjs/feathers'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { data, app } = context
    const requiredParams = ['text', 'senderId', 'conversationId']
    const emptyError: any[] = []
    const requiredError: any[] = []
    requiredParams.forEach((param: any) => {
      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty(param)) {
        if (data[param].toString().trim() === '') {
          emptyError.push(param)
        }
      } else {
        requiredError.push(param)
      }
    })
    if (requiredError.length) {
      throw new Error('Required data: ' + requiredParams.join(', '))
    }

    if (emptyError.length) {
      throw new Error('Empty data: ' + emptyError.join(', '))
    }
    const conversation = await app.service('conversation').Model.findOne({
      where: {
        id: data.conversationId
      }
    })
    if (Object.keys(conversation).length === 0) {
      throw new Error('conversationId is invalid.')
    }

    return context
  }
}
