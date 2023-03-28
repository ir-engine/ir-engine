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

    if (podName.startsWith(`${config.server.releaseName}-`) === false) {
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
