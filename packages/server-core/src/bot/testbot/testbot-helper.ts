import { Application } from '../../../declarations'
import config from '@xrengine/server-core/src/appconfig'

export const getTestbotPod = async (app: Application) => {
  if (app.k8DefaultClient) {
    try {
      const podsResult = await app.k8DefaultClient.get(
        `pods?labelSelector=job-name%3D${config.server.releaseName}-xrengine-testbot`
      )
      return podsResult
    } catch (e) {
      console.log(e)
      return e
    }
  }
}
