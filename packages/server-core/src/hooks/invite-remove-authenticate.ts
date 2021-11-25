import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../user/auth-management/auth-management.utils'
import { BadRequest } from '@feathersjs/errors'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    let inviteIdentityProviderUser
    // Getting logged in user and attaching owner of user
    const { id, params, app } = context
    const loggedInUser = extractLoggedInUserFromParams(params)
    const invite = await app.service('invite').get(id!)
    if (invite == null) {
      throw new BadRequest('Invalid invite ID')
    }
    if (invite.identityProviderType != null) {
      const inviteeIdentityProviderResult = await app.service('identity-provider').find({
        query: {
          type: invite.identityProviderType,
          token: invite.token
        }
      })
      if ((inviteeIdentityProviderResult as any).total > 0) {
        inviteIdentityProviderUser = (inviteeIdentityProviderResult as any).data[0].userId
      }
    }
    if (
      invite.userId !== loggedInUser?.userId &&
      invite.inviteeId !== loggedInUser?.userId &&
      inviteIdentityProviderUser !== loggedInUser?.userId
    ) {
      throw new BadRequest('Not the sender or recipient of this invite')
    }
    return context
  }
}
