import { Hook, HookContext } from '@feathersjs/feathers'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { app, id } = context

    await app.service('message-status').Model.destroy({
      where: {
        messageId: id
      }
    })

    return context
  }
}
