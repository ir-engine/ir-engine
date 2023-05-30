import { BadRequest } from '@feathersjs/errors'
import { Hook, HookContext } from '@feathersjs/feathers'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { matchUserPath } from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'

/**
 * prevent user to join new search game more then once at time
 */
export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, params } = context
    const loggedInUser = params.user as UserInterface
    const matchUserResult = await app.service(matchUserPath).find({
      query: {
        userId: loggedInUser.id,
        $limit: 1
      }
    })

    if (matchUserResult.data.length) {
      throw new BadRequest('User already queued')
    }

    return context
  }
}
