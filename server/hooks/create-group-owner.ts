import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils'
import { BadRequest, Forbidden } from '@feathersjs/errors'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return (context: HookContext): HookContext => {
    console.log('CREATING GROUP OWNER')
    // Getting logged in user and attaching owner of user
    const { result } = context
    const loggedInUser = extractLoggedInUserFromParams(context.params)
    return context.app.service('group-user').create({
      groupId: result.id,
      groupUserRank: 'owner',
      userId: loggedInUser.userId
    })
        .then(() => {
          return context
        })
  }
}
