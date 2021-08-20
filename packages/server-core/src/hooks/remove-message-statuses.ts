import { Hook, HookContext } from '@feathersjs/feathers'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, id } = context

    await (app.service('message-status') as any).Model.destroy({
      where: {
        messageId: id
      }
    })

    return context
  }
}
