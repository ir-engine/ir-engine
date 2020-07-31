import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils'
import { BadRequest, Forbidden } from '@feathersjs/errors'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    // Getting logged in user and attaching owner of user
    console.log('INVITE DELETE AUTHENTICATE')
    const { id, params, app, path } = context
    const loggedInUser = extractLoggedInUserFromParams(params)
    const invite = await app.service('invite').get(id)
    if (invite == null) {
      throw new BadRequest('Invalid invite ID')
    }
    if (invite.userId !== loggedInUser.userId && invite.inviteeId !== loggedInUser.userId) {
      throw new BadRequest('Not the sender or recipient of this invite')
    }
    return context
  }
}
