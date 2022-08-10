import { Hook, HookContext } from '@feathersjs/feathers'

import { Application } from './../../declarations'

export default (): Hook => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    const { app, id } = context

    await app.service('message-status').Model.destroy({
      where: {
        messageId: id
      }
    })

    return context
  }
}
