import { BadRequest } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import _ from 'lodash'

import logger from '../logger'
import { UserDataType } from '../user/user/user.class'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { params, app } = context
    const loggedInUser = params.user as UserDataType
    const partyId = params.query!.partyId
    const userId = params.query!.userId || loggedInUser.id
    const paramsClone = _.cloneDeep(context.params)
    paramsClone.provider = null!
    if (params.partyUsersRemoved !== true) {
      const partyUserResult = await app.service('party-user').find({
        query: {
          partyId: partyId,
          userId: userId
        }
      })
      if (partyUserResult.total === 0) {
        logger.error(`Could not find results for partyId "${partyId}", userId: "${userId}".`)
        throw new BadRequest('Invalid party ID in party-user-permission')
      }
    }
    return context
  }
}
