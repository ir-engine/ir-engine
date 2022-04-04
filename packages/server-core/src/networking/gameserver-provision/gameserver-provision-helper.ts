import { Paginated } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import { LocationDataType } from '../../social/location/location.class'
import { getFreeGameserver } from '../instance-provision/instance-provision.class'

export const patchGameserverLocation = async (app: Application, locationId) => {
  try {
    const location = (await app.service('location').find({
      query: {
        id: locationId
      }
    })) as Paginated<LocationDataType>

    if (!location.data.length) {
      const message = `Failed to patch gameserver. (Location for id '${locationId}' is not found.)`
      console.log(message)
      return { status: false, message }
    }

    const freeInstance = await getFreeGameserver(app, 0, locationId, null!)

    await app.service('gameserver-load').patch({
      id: freeInstance.id,
      ipAddress: freeInstance.ipAddress,
      podName: freeInstance.podName,
      locationId,
      sceneId: location.data[0].sceneId
    })

    return { status: true, message: 'Gameserver patched successfully' }
  } catch (e) {
    console.log(e)
    return { status: false, message: `Failed to patch gameserver. (${e.body.reason})` }
  }
}
