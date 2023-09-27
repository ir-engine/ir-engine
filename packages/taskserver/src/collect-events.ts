/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { getState } from '@etherealengine/hyperflux'
import { default as multiLogger, default as serverLogger } from '@etherealengine/server-core/src/ServerLogger'
import { ServerState } from '@etherealengine/server-core/src/ServerState'
import config from '@etherealengine/server-core/src/appconfig'

const logger = multiLogger.child({ component: 'taskserver:collect-analytics' })

const DEFAULT_INTERVAL_SECONDS = 1800
const configInterval = parseInt(config.taskserver.processInterval)
const interval = (configInterval || DEFAULT_INTERVAL_SECONDS) * 1000

const k8DefaultClient = getState(ServerState).k8DefaultClient

export default (app): void => {
  setInterval(async () => {
    logger.info('Collecting events at %s.', new Date().toString())

    if (k8DefaultClient) {
      try {
        const jobName = `${config.server.releaseName}-etherealengine-testbot`
        const podsResult = await k8DefaultClient.listNamespacedPod('default')

        for (const pod of podsResult.body.items) {
          logger.info(podsResult.body.items.length)
          let labels = pod.metadata!.labels
          if (labels && labels['job-name'] && labels['job-name'] === jobName) {
            logger.info('Pod:', pod.metadata!.name!)
            logger.info('status', pod.status!.phase!)
          }
        }
      } catch (e) {
        serverLogger.error(e)
        return e
      }
    }
  })
}
