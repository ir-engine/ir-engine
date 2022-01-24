import { Application } from '../../../declarations'
import config from '@xrengine/server-core/src/appconfig'

export const getTestbotPod = async (app: Application) => {
  if (app.k8DefaultClient) {
    try {
      const podsResult = await app.k8DefaultClient.listNamespacedPod('default')
      let pods: any = []
      for (const pod of podsResult.body.items) {
        let labels = pod.metadata.labels
        if (labels && labels['job-name'] && labels['job-name'] === `${config.server.releaseName}-xrengine-testbot`) {
          pods.push({
            name: pod.metadata.name,
            status: pod.status.phase
          })
        }
      }
      return pods
    } catch (e) {
      console.log(e)
      return e
    }
  }
}
