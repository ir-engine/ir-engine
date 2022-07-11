import { Forbidden } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import { LocationAdmin } from '@xrengine/common/src/interfaces/LocationAdmin'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../declarations'

export default () => {
  return async (context: HookContext<Application>) => {
    const { app, data, params } = context
    const loggedInUser = params.user as UserInterface
    const locationAdmins = (await app.service('location-admin').find({
      query: {
        locationId: data.locationId,
        userId: loggedInUser.id
      }
    })) as Paginated<LocationAdmin>
    if (locationAdmins.total === 0) {
      throw new Forbidden('Not an admin of that location')
    }
    return context
  }
}
