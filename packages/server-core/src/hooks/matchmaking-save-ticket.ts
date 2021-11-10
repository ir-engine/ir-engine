import { Hook, HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../user/auth-management/auth-management.utils'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result } = context

    const loggedInUser = extractLoggedInUserFromParams(context.params)
    await app.service('match-user').create({
      ticketId: result.id,
      userId: loggedInUser.userId
    })

    return context
  }
}
