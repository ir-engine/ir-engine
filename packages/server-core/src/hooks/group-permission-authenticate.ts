import { BadRequest, Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

import { UserInterface } from '@xrengine/common/src/interfaces/User'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    let fetchedGroupId
    const { id, method, params, app, path } = context
    const loggedInUser = params.user as UserInterface
    if (path === 'group-user' && method === 'remove') {
      const groupUser = await app.service('group-user').get(id!, null!)
      fetchedGroupId = groupUser.groupId
    }
    const groupId =
      path === 'group-user' && method === 'find' ? params.query!.groupId : fetchedGroupId != null ? fetchedGroupId : id
    params.query!.groupId = groupId
    const userId = path === 'group' ? loggedInUser.id : params.query!.userId || loggedInUser.id
    const groupUserCountResult = await app.service('group-user').find({
      query: {
        groupId: groupId,
        $limit: 0
      }
    })
    if (groupUserCountResult.total > 0) {
      const groupUserResult = await app.service('group-user').find({
        query: {
          groupId: groupId,
          userId: userId
        }
      })
      if (groupUserResult.total === 0) {
        throw new BadRequest('Invalid group ID')
      }
      const groupUser = groupUserResult.data[0]
      if (
        params.groupUsersRemoved !== true &&
        groupUser.groupUserRank !== 'owner' &&
        groupUser.groupUserRank !== 'admin' &&
        groupUser.userId !== loggedInUser.id
      ) {
        throw new Forbidden('You must be the owner or an admin of this group to perform that action')
      }
    }

    if (path === 'group') {
      delete params.query!.groupId
    }
    return context
  }
}
