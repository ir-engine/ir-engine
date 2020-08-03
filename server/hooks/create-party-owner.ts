import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    // Getting logged in user and attaching owner of user
    const { result } = context
    const loggedInUser = extractLoggedInUserFromParams(context.params)
    await context.app.service('party-user').create({
      partyId: result.id,
      isOwner: true,
      userId: loggedInUser.userId
    })
    return context
  }
}
