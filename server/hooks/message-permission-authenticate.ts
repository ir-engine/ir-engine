import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils'
import { BadRequest, Forbidden } from '@feathersjs/errors'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { id, data, params, app } = context
    const loggedInUser = extractLoggedInUserFromParams(params)
    const targetObjectId = data.targetObjectId
    const targetObjectType = data.targetObjectType
    const userId = params.query.userId || loggedInUser.userId

    if (targetObjectType === 'friend') {
      const userRelationship = await app.service('user-relationship').find({
        query: {
          userId: userId,
          relatedUserId: targetObjectId,
          type: 'friend',
          $limit: 0
        }
      })
      if (userRelationship.total === 0) {
        throw new BadRequest('You are not friends with that user, or that user does not exist')
      }
    }
    else if (targetObjectType === 'group') {
      const group = await app.service('group').get(targetObjectId)
      if (group == null) {
        throw new BadRequest('Invalid group ID')
      }
      const selfGroupUser = await app.service('group-user').find({
        query: {
          groupId: targetObjectId,
          userId: userId,
          $limit: 0
        }
      })
      if(selfGroupUser.total === 0) {
        throw new BadRequest('You are not a member of that group')
      }
    }
    else if (targetObjectType === 'party') {
      const party = await app.service('party').get(targetObjectId)
      if (party == null) {
        throw new BadRequest('Invalid party ID')
      }
      const selfPartyUser = await app.service('party-user').find({
        query: {
          partyId: targetObjectId,
          userId: userId,
          $limit: 0
        }
      })
      if(selfPartyUser.total === 0) {
        throw new BadRequest('You are not a member of that party')
      }
    }
    else {
      throw new BadRequest('Invalid channel type')
    }
    return context
  }
}
