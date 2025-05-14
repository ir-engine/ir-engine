/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { SpawnTestBot, TestBot } from '@ir-engine/common/src/interfaces/TestBot'
import { getState } from '@ir-engine/hyperflux'
import config from '@ir-engine/server-core/src/appconfig'
import serverLogger from '@ir-engine/server-core/src/ServerLogger'

import { Application } from '../../../declarations'
import { ServerState } from '../../ServerState'

export const getTestbotPod = async (app: Application) => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const jobName = `${config.server.releaseName}-ir-engine-testbot`
      const podsResult = await k8DefaultClient.listNamespacedPod({
        namespace: config.server.namespace
      })
      let pods: TestBot[] = []
      for (const pod of podsResult.items) {
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
      const jobName = `${config.server.releaseName}-ir-engine-testbot`
      const oldJobResult = await k8BatchClient.readNamespacedJob({ name: jobName, namespace: config.server.namespace })

      if (oldJobResult) {
        // Removed unused properties
        delete oldJobResult.metadata!.managedFields
        delete oldJobResult.metadata!.resourceVersion
        delete oldJobResult.spec!.selector
        delete oldJobResult.spec!.template!.metadata!.labels

        oldJobResult.spec!.suspend = false

        const deleteJobResult = await k8BatchClient.deleteNamespacedJob({
          name: jobName,
          namespace: config.server.namespace,
          gracePeriodSeconds: 0,
          propagationPolicy: 'Background'
        })

        if (deleteJobResult.status === 'Success') {
          await k8BatchClient.createNamespacedJob({ namespace: config.server.namespace, body: oldJobResult })

          return { status: true, message: 'Bot spawned successfully' }
        }
      }
    } catch (e) {
      serverLogger.error(e)
      return { status: false, message: `Failed to spawn bot. (${e.reason})` }
    }
  }

  return { status: false, message: 'Failed to spawn bot' }
}
