import { BotPod, SpawnBotPod } from '@etherealengine/common/src/interfaces/AdminBot'
import { getState } from '@etherealengine/hyperflux'
import config from '@etherealengine/server-core/src/appconfig'
import serverLogger from '@etherealengine/server-core/src/ServerLogger'

import { Application } from '../../../declarations'
import { ServerState } from '../../ServerState'

export const getBotPodBody = () => {}
export const createBotPod = async (data: any) => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const jobName = `${config.server.releaseName}-etherealengine-bot-${data.id}`
    } catch (e) {
      serverLogger.error(e)
      return e
    }
  }
}

export const getBotPod = async (app: Application) => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const jobNamePrefix = `${config.server.releaseName}-etherealengine-bot`
      const podsResult = await k8DefaultClient.listNamespacedPod(
        'default',
        undefined,
        undefined,
        undefined,
        undefined,
        `job-name=${jobNamePrefix}`
      ) // filter metadta label by prefix
      const pods: BotPod[] = []
      for (const pod of podsResult.body.items) {
        const labels = pod.metadata!.labels
        if (labels && labels['job-name'] && labels['job-name'].includes(jobNamePrefix)) {
          // double check
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
export const runBotPodJob = async (app: Application): Promise<SpawnBotPod> => {
  const k8BatchClient = getState(ServerState).k8BatchClient
  if (k8BatchClient) {
    try {
      const jobName = `${config.server.releaseName}-etherealengine-bot`
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
