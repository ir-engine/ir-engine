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

import { BadRequest } from '@feathersjs/errors/lib'

import { getState } from '@etherealengine/hyperflux'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { ServerState } from '../../ServerState'

export const getServerLogs = async (podName: string, containerName: string, app: Application): Promise<string> => {
  let serverLogs = ''

  try {
    logger.info('Attempting to check k8s server logs')

    if (!podName.startsWith(`${config.server.releaseName}-`)) {
      logger.error('You can only request server logs for current deployment.')
      new BadRequest('You can only request server logs for current deployment.')
    }

    const k8DefaultClient = getState(ServerState).k8DefaultClient
    if (k8DefaultClient) {
      const podLogs = await k8DefaultClient.readNamespacedPodLog(
        podName,
        'default',
        containerName,
        undefined,
        false,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      )

      serverLogs = podLogs.body
    }
  } catch (e) {
    logger.error(e)
    return e
  }

  return serverLogs
}
