import { Hook, HookContext } from '@feathersjs/feathers'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { app, params } = context
    app.service('message-status').Model.update(
      { isDelivered: true },
      { where: { recipientId: params['identity-provider'].userId } }
    )
    return context
  }
}
