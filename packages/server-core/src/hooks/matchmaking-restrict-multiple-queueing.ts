import { BadRequest } from '@feathersjs/errors'
import { Hook, HookContext } from '@feathersjs/feathers'

import { UserInterface } from '@xrengine/common/src/interfaces/User'

/**
 * prevent user to join new search game more then once at time
 */
export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, params } = context
    const loggedInUser = params.user as UserInterface
    const matchUserResult = await app.service('match-user').find({
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
