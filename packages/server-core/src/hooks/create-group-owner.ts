import { HookContext } from '@feathersjs/feathers'

import { UserInterface } from '@xrengine/common/src/interfaces/User'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    // Getting logged in user and attaching owner of user
    const { result, params } = context
    const loggedInUser = params.user as UserInterface
    await context.app.service('group-user').create({
      groupId: result.id,
      groupUserRank: 'owner',
      userId: loggedInUser.id
    })
    return context
  }
}
