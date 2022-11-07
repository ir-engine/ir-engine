import { Paginated, Params } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { LocationDataType } from '../../social/location/location.class'
import { getFreeInstanceserver } from '../instance-provision/instance-provision.class'

type Props = {
  locationId: string
  count: number
}

export const patchInstanceserverLocation =
  (app: Application) =>
  async ({ locationId, count }: Props, params?: Params) => {
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

      const patchServer = async () => {
        const freeInstance = await getFreeInstanceserver({ app, iteration: 0, locationId })
        await app.service('instanceserver-load').patch({
          id: freeInstance.id,
          ipAddress: freeInstance.ipAddress,
          podName: freeInstance.podName,
          locationId,
          sceneId: location.data[0].sceneId
        })

        logger.info('successfully patched instance server %o', { ...freeInstance, locationId })
      }

      for (let i = 0; i < count; i++) patchServer()

      return { status: true, message: 'instanceserver patched successfully' }
    } catch (e) {
      logger.error(e)
      return { status: false, message: `Failed to patch instanceserver. (${e.body.reason})` }
    }
  }
