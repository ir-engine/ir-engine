import { Hook, HookContext } from '@feathersjs/feathers'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { matchUserPath } from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result, data, params } = context
    const loggedInUser = params.user as UserInterface
    await app.service(matchUserPath).create({
      ticketId: result.id,
      gamemode: data.gamemode,
      userId: loggedInUser.id
    })

    return context
  }
}
