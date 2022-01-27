import { Application } from '../../../declarations'
import { TestBot, SpawnTestBot } from '@xrengine/common/src/interfaces/TestBot'
import config from '@xrengine/server-core/src/appconfig'

export const getTestbotPod = async (app: Application) => {
  if (app.k8DefaultClient) {
    try {
      const jobName = `${config.server.releaseName}-xrengine-testbot`
      const podsResult = await app.k8DefaultClient.listNamespacedPod('default')
      let pods: TestBot[] = []
      for (const pod of podsResult.body.items) {
        let labels = pod.metadata.labels
        if (labels && labels['job-name'] && labels['job-name'] === jobName) {
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

/**
 * Reference:
 * https://serverfault.com/a/888819
 * https://stackoverflow.com/a/61864881
 * @param app
 * @returns
 */
export const runTestbotJob = async (app: Application): Promise<SpawnTestBot> => {
  if (app.k8BatchClient) {
    try {
      const jobName = `${config.server.releaseName}-xrengine-testbot`
      const oldJobResult = await app.k8BatchClient.readNamespacedJob(jobName, 'default')

      if (oldJobResult && oldJobResult.body) {
        // Removed unused properties
        delete oldJobResult.body.metadata.managedFields
        delete oldJobResult.body.metadata.resourceVersion
        delete oldJobResult.body.spec.selector
        delete oldJobResult.body.spec.template.metadata.labels

        oldJobResult.body.spec.suspend = false

        const deleteJobResult = await app.k8BatchClient.deleteNamespacedJob(
          jobName,
          'default',
          undefined,
          undefined,
          0,
          undefined,
          'Background'
        )

        if (deleteJobResult.body.status === 'Success') {
          await app.k8BatchClient.createNamespacedJob('default', oldJobResult.body)

          return { status: true, message: 'Bot spawned successfully' }
        }
      }
    } catch (e) {
      console.log(e)
      return { status: false, message: `Failed to spawn bot. (${e.body.reason})` }
    }
  }

  return { status: false, message: 'Failed to spawn bot' }
}
