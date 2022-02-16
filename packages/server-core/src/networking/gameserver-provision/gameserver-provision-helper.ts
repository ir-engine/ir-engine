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
      if (!location.data.length) {
        // throw error?!
        throw new Error(`Location for id '${locationId}' is not found.`)
      }

      const freeInstance = await getFreeGameserver(app, 0, locationId, null!)

      app.service('gameserver-load').patch({ id: freeInstance.id, locationId, sceneId: location.sceneId })
    } catch (e) {
      console.log(e)
      return e
    }
  }
}
