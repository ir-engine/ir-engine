import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../user/auth-management/auth-management.utils'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    // Getting logged in user and attaching owner of user
    const { result } = context
    const loggedInUser = extractLoggedInUserFromParams(context.params)
    await context.app.service('group-user').create({
      groupId: result.id,
      groupUserRank: 'owner',
      userId: loggedInUser.id
    })
    return context
  }
}
