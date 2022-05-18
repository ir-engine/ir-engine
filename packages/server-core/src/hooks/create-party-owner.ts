import { HookContext } from '@feathersjs/feathers'

import logger from '../logger'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return async (context: HookContext): Promise<HookContext> => {
    // Getting logged in user and attaching owner of user
    const { result, params } = context

    const user = params.user // TODO: add location_admins type // as User
    let ownerUser = false
    if (user.location_admins) {
      ownerUser =
        user.location_admins.length > 0
          ? user.location_admins.find((locationAdmin) => locationAdmin.locationId === result.locationId) != null
          : false
    }
    try {
      await context.app.service('party-user').create(
        {
          partyId: result.id,
          isOwner: result.locationId ? ownerUser : true,
          userId: user.id
        },
        context.params
      )
    } catch (error) {
      logger.error(error)
    }
    await context.app.service('user').patch(user.id, {
      partyId: result.id
    })
    const owner = await context.app.service('user').get(user.id)
    if (owner.instanceId != null) {
      await context.app.service('party').patch(result.id, { instanceId: owner.instanceId }, context.params)
    }
    return context
  }
}
