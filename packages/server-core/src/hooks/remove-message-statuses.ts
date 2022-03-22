import { Hook, HookContext } from '@feathersjs/feathers'

import { Application } from './../../declarations.d'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, id } = context

    await (app as Application).service('message-status').Model.destroy({
      where: {
        messageId: id
      }
    })

    return context
  }
}
