import { HookContext } from '@feathersjs/feathers'

import { UserDataType } from '../user/user/user.class'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    // Getting logged in user and attaching owner of user
    const { result, params } = context
    const loggedInUser = params.user as UserDataType
    await context.app.service('group-user').create({
      groupId: result.id,
      groupUserRank: 'owner',
      userId: loggedInUser.id
    })
    return context
  }
}
