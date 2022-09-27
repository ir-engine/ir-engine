import { Paginated } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { LocationDataType } from '../../social/location/location.class'
import { getFreeInstanceserver } from '../instance-provision/instance-provision.class'

export const patchInstanceserverLocation = async (app: Application, locationId) => {
  try {
    const location = (await app.service('location').find({
      query: {
        id: locationId
      }
    })) as Paginated<LocationDataType>

    if (!location.data.length) {
      const message = `Failed to patch instanceserver. (Location for id '${locationId}' is not found.)`
      logger.info(message)
      return { status: false, message }
    }

    const freeInstance = await getFreeInstanceserver(app, 0, locationId, null!)

    await app.service('instanceserver-load').patch({
      id: freeInstance.id,
      ipAddress: freeInstance.ipAddress,
      podName: freeInstance.podName,
      locationId,
      sceneId: location.data[0].sceneId
    })

    return { status: true, message: 'instanceserver patched successfully' }
  } catch (e) {
    logger.error(e)
    return { status: false, message: `Failed to patch instanceserver. (${e.body.reason})` }
  }
}
