import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../user/auth-management/auth-management.utils'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    // Getting logged in user and attaching owner of user
    const { result } = context
    const loggedInUser = extractLoggedInUserFromParams(context.params)
    if (loggedInUser?.id != null) {
      const user = await context.app.service('user').get(loggedInUser.id)
      if (user.partyId) {
        const partyOwnerResult = await context.app.service('party-user').find({
          query: {
            partyId: user.partyId,
            isOwner: 1
          }
        })
        if (partyOwnerResult.total > 1) {
          const selfPartyUser = partyOwnerResult.data.find((partyUser) => partyUser.userId === user.id)
          await context.app.service('party-user').patch(
            selfPartyUser.id,
            {
              isOwner: 0
            },
            context.params
          )
        }
      }
    }
    return context
  }
}
