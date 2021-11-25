import { HookContext } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../user/auth-management/auth-management.utils'
import { BadRequest } from '@feathersjs/errors'
import _ from 'lodash'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<any> => {
    const { params, app } = context
    const loggedInUser = extractLoggedInUserFromParams(params)
    const partyId = params.query!.partyId
    const userId = params.query!.userId || loggedInUser.userId
    const paramsClone = _.cloneDeep(context.params)
    paramsClone.provider = null!
    if (params.partyUsersRemoved !== true) {
      const partyUserResult = await app.service('party-user').find(
        {
          query: {
            partyId: partyId,
            userId: userId
          }
        },
        paramsClone as any
      )
      if (partyUserResult.total === 0) {
        console.log('INVALID PARTY ID')
        throw new BadRequest('Invalid party ID in party-user-permission')
      }
    }
    return context
  }
}
