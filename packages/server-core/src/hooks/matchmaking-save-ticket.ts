import { Hook, HookContext } from '@feathersjs/feathers'

import { UserInterface } from '@xrengine/common/src/interfaces/User'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result, data, params } = context
    const loggedInUser = params.user as UserInterface
    await app.service('match-user').create({
      ticketId: result.id,
      gamemode: data.gamemode,
      userId: loggedInUser.id
    })

    return context
  }
}
