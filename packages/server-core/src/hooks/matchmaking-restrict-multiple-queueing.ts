import { Hook, HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from "../user/auth-management/auth-management.utils";
import { BadRequest } from "@feathersjs/errors";

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app } = context
    console.log('HOOK! restrict user multiple queueing')

    const loggedInUser = extractLoggedInUserFromParams(context.params)
    console.log('userId', loggedInUser.userId)

    const matchUserResult = await app.service('match-user').find({
      query: {
        userId: loggedInUser.userId,
        $limit: 1
      }
    })
    console.log('userId', matchUserResult.data.length)
    if (matchUserResult.data.length) {
      throw new BadRequest('User already queued')
    }

    return context
  }
}
