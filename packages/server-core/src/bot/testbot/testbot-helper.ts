import { SpawnTestBot, TestBot } from '@etherealengine/common/src/interfaces/TestBot'
import { getState } from '@etherealengine/hyperflux'
import config from '@etherealengine/server-core/src/appconfig'
import serverLogger from '@etherealengine/server-core/src/ServerLogger'

import { Application } from '../../../declarations'
import { ServerState } from '../../ServerState'

export const getTestbotPod = async (app: Application) => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const jobName = `${config.server.releaseName}-etherealengine-testbot`
      const podsResult = await k8DefaultClient.listNamespacedPod('default')
      let pods: TestBot[] = []
      for (const pod of podsResult.body.items) {
        let labels = pod.metadata!.labels
        if (labels && labels['job-name'] && labels['job-name'] === jobName) {
          pods.push({
            name: pod.metadata!.name!,
            status: pod.status!.phase!
          })
        }
      }
      return pods
    } catch (e) {
      serverLogger.error(e)
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
  const k8BatchClient = getState(ServerState).k8BatchClient
  if (k8BatchClient) {
    try {
      const jobName = `${config.server.releaseName}-etherealengine-testbot`
      const oldJobResult = await k8BatchClient.readNamespacedJob(jobName, 'default')

      if (oldJobResult && oldJobResult.body) {
        // Removed unused properties
        delete oldJobResult.body.metadata!.managedFields
        delete oldJobResult.body.metadata!.resourceVersion
        delete oldJobResult.body.spec!.selector
        delete oldJobResult.body.spec!.template!.metadata!.labels

        oldJobResult.body.spec!.suspend = false

        const deleteJobResult = await k8BatchClient.deleteNamespacedJob(
          jobName,
          'default',
          undefined,
          undefined,
          0,
          undefined,
          'Background'
        )

        if (deleteJobResult.body.status === 'Success') {
          await k8BatchClient.createNamespacedJob('default', oldJobResult.body)

          return { status: true, message: 'Bot spawned successfully' }
        }
      }
    } catch (e) {
      serverLogger.error(e)
      return { status: false, message: `Failed to spawn bot. (${e.body.reason})` }
    }
  }

  return { status: false, message: 'Failed to spawn bot' }
}
