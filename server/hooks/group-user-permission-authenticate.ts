import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils'
import { BadRequest, Forbidden } from '@feathersjs/errors'
import _ from 'lodash'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { id, params, method, app, path } = context
    const loggedInUser = extractLoggedInUserFromParams(params)
    const groupId = params.query.groupId
    const userId = params.query.userId || loggedInUser.userId
    console.log('groupId: ' + groupId)
    console.log('userId: ' + userId)
    const paramsClone = _.cloneDeep(context.params)
    paramsClone.provider = null
    console.log('GROUP USER METHOD: ' + method)
    if (params.groupUsersRemoved !== true) {
      const groupUserResult = await app.service('group-user').find({
        query: {
          groupId: groupId,
          userId: userId
        }
      }, paramsClone)
      if (groupUserResult.total === 0) {
        console.log('GROUP USER PERMISSION FAILURE')
        console.log(groupUserResult)
        console.log(params)
        throw new BadRequest('Invalid group ID in group-user-permission')
      }
    }
    return context
  }
}
