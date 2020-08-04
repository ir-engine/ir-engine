import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../services/auth-management/auth-management.utils'
import { Forbidden } from '@feathersjs/errors'
import _ from 'lodash'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, params } = context
    const loggedInUser = extractLoggedInUserFromParams(params)
    const partyId = params.query.partyId
    const userId = params.query.userId || loggedInUser.userId
    const paramsClone = _.cloneDeep(context.params)
    paramsClone.provider = null
    if (params.partyUsersRemoved !== true) {
      const partyUserResult = await app.service('party-user').find({
        query: {
          partyId: partyId,
          userId: userId
        }
      }, paramsClone)
      if (partyUserResult.total === 0) {
        throw new Forbidden('Invalid party ID in party-user-permission')
      }
    }
    return context
  }
}
