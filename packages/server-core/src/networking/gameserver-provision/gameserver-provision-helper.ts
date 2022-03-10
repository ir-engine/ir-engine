import { Application } from '../../../declarations'
import { getFreeGameserver } from '../instance-provision/instance-provision.class'

export const patchGameserverLocation = async (app: Application, locationId) => {
  if (app.k8DefaultClient) {
    try {
      const location = await app.service('location').find({
        query: {
          id: locationId
        }
      })

      console.log(locationId)
      console.log(location)

      if (!location.data.length) {
        const message = `Failed to patch gameserver. (Location for id '${locationId}' is not found.)`
        console.log(message)
        return { status: false, message }
      }

      const freeInstance = await getFreeGameserver(app, 0, locationId, null!)

      console.log(freeInstance)

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

  return { status: false, message: 'Failed to patch gameserver' }
}
