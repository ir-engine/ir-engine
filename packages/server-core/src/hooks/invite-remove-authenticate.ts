import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

import { IdentityProviderInterface } from '@xrengine/common/src/dbmodels/IdentityProvider'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import Paginated from '../types/PageObject'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    console.log('inviteRemoveAuthenticate')
    let inviteIdentityProviderUser
    // Getting logged in user and attaching owner of user
    const { id, params, app } = context
    const loggedInUser = params.user as UserInterface
    console.log('id', id)
    const invite = await app.service('invite').get(id!)
    console.log('invite to remove', invite)
    if (invite == null) {
      throw new BadRequest('Invalid invite ID')
    }
    if (invite.identityProviderType != null) {
      const inviteeIdentityProviderResult = (await app.service('identity-provider').find({
        query: {
          type: invite.identityProviderType,
          token: invite.token
        }
      })) as Paginated<IdentityProviderInterface>
      if (inviteeIdentityProviderResult.total > 0) {
        inviteIdentityProviderUser = inviteeIdentityProviderResult.data[0].userId
      }
    }
    if (
      invite.userId !== loggedInUser?.id &&
      invite.inviteeId !== loggedInUser?.id &&
      inviteIdentityProviderUser !== loggedInUser?.id
    ) {
      throw new BadRequest('Not the sender or recipient of this invite')
    }
    return context
  }
}
