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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { BadRequest } from '@feathersjs/errors/lib'
import * as k8s from '@kubernetes/client-node'

import { PodsType, ServerContainerInfoType, ServerPodInfoType } from '@ir-engine/common/src/schemas/cluster/pods.schema'
import { instancePath, InstanceType } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { channelPath, ChannelType } from '@ir-engine/common/src/schemas/social/channel.schema'
import { getState } from '@ir-engine/hyperflux'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { ServerState } from '../../ServerState'

export const getServerInfo = async (app: Application) => {
  const serverInfo: PodsType[] = []

  const k8DefaultClient = getState(ServerState).k8DefaultClient

  try {
    logger.info('Attempting to check k8s server info')

    if (k8DefaultClient) {
      const builderPods = await getPodsData(
        `app.kubernetes.io/instance=${config.server.releaseName}-builder`,
        'builder',
        'Builder',
        app
      )
      serverInfo.push(builderPods)

      const clientPods = await getPodsData(
        `app.kubernetes.io/instance=${config.server.releaseName},app.kubernetes.io/component=client`,
        'client',
        'Client',
        app
      )
      serverInfo.push(clientPods)

      const apiPods = await getPodsData(
        `app.kubernetes.io/instance=${config.server.releaseName},app.kubernetes.io/component=api`,
        'api',
        'Api',
        app
      )
      serverInfo.push(apiPods)

      const instancePods = await getPodsData(
        'agones.dev/role=gameserver',
        'instance',
        'Instance',
        app,
        `${config.server.releaseName}-instanceserver-`
      )

      await populateInstanceServerType(app, instancePods.pods)
      serverInfo.push(instancePods)

      const taskPods = await getPodsData(
        `app.kubernetes.io/instance=${config.server.releaseName},app.kubernetes.io/component=taskserver`,
        'task',
        'Task',
        app
      )
      serverInfo.push(taskPods)

      const projectUpdatePods = await getPodsData(
        `ir-engine/release=${config.server.releaseName},ir-engine/projectUpdater=true`,
        'projectUpdate',
        'Project Updater',
        app
      )
      serverInfo.push(projectUpdatePods)

      const jobsPods = await getPodsData(
        `ir-engine/release=${config.server.releaseName},ir-engine/isJob=true`,
        'jobs',
        'Jobs',
        app
      )
      serverInfo.push(jobsPods)
    }

    // if (k8AgonesClient) {
    //   const instancePods = await getGameserversData(`agones.dev/fleet=${config.server.releaseName}-instanceserver`, 'instance', 'Instance', app)
    //   serverInfo.push(instancePods)
    // }
  } catch (e) {
    logger.error(e)
    throw e
  }

  return serverInfo
}

export const removePod = async (app: Application, podName: string) => {
  try {
    logger.info(`Attempting to remove k8s pod ${podName}`)

    const k8DefaultClient = getState(ServerState).k8DefaultClient
    if (k8DefaultClient) {
      const podsResponse = await k8DefaultClient.deleteNamespacedPod(podName, 'default')
      return getServerPodInfo(podsResponse.body)
    }
  } catch (e) {
    logger.error(e)
    return e
  }
}

export const getPodsData = async (
  labelSelector: string,
  id: string,
  label: string,
  app: Application,
  nameFilter?: string
) => {
  let pods: ServerPodInfoType[] = []

  try {
    const k8DefaultClient = getState(ServerState).k8DefaultClient
    const podsResponse = await k8DefaultClient.listNamespacedPod(
      'default',
      undefined,
      false,
      undefined,
      undefined,
      labelSelector
    )

    let items = podsResponse.body.items
    if (nameFilter) {
      items = items.filter((item) => item.metadata?.name?.startsWith(nameFilter))
    }

    pods = getServerPodsInfo(items)
  } catch (err) {
    logger.error('Failed to get pods info.', err)
  }

  return {
    id,
    label,
    pods
  }
}

const getGameserversData = async (labelSelector: string, id: string, label: string) => {
  let gameservers: ServerPodInfoType[] = []

  try {
    const k8AgonesClient = getState(ServerState).k8AgonesClient
    const gameserversResponse = await k8AgonesClient.listNamespacedCustomObject(
      'agones.dev',
      'v1',
      'default',
      'gameservers',
      undefined,
      false,
      undefined,
      undefined,
      labelSelector
    )
    gameservers = getServerPodsInfo((gameserversResponse.body as any).items)
  } catch (err) {
    logger.error('Failed to get pods info.', err)
  }

  return {
    id,
    label,
    pods: gameservers
  }
}

const getServerPodsInfo = (items: k8s.V1Pod[]) => {
  return items.map((item) => {
    return getServerPodInfo(item)
  })
}

const getServerPodInfo = (item: k8s.V1Pod) => {
  return {
    name: item.metadata?.name,
    status: item.status?.phase,
    age: item.status?.startTime?.toString(),
    containers: getServerContainerInfo(item.status?.containerStatuses!)
  } as ServerPodInfoType
}

const getServerContainerInfo = (items: k8s.V1ContainerStatus[]) => {
  return items.map((item) => {
    return {
      name: item.name,
      status: item.state?.running
        ? 'Running'
        : item.state?.terminated
        ? 'Terminated'
        : item.state?.waiting
        ? 'Waiting'
        : 'Undefined',
      ready: item.ready,
      started: item.started,
      restarts: item.restartCount,
      image: item.image
    } as ServerContainerInfoType
  })
}

const populateInstanceServerType = async (app: Application, items: ServerPodInfoType[]) => {
  if (items.length === 0) {
    return
  }

  const instances = (await app.service(instancePath).find({
    query: {
      ended: false
    },
    paginate: false
  })) as InstanceType[]

  if (instances.length === 0) {
    return
  }

  const channelInstances = instances.filter((item) => item.channelId)
  let channels: ChannelType[] = []

  if (channelInstances) {
    channels = (await app.service(channelPath).find({
      query: {
        id: {
          $in: channelInstances.map((item) => item.channelId!)
        }
      },
      paginate: false
    })) as ChannelType[]
  }

  for (const item of items) {
    const instanceExists = instances.find((instance) => instance.podName === item.name)
    item.instanceId = instanceExists ? instanceExists.id : undefined
    item.currentUsers = instanceExists ? instanceExists.currentUsers : 0
    if (!instanceExists) {
      item.type = 'Unassigned'
      continue
    }
    if (!instanceExists.locationId && !instanceExists.channelId) {
      item.type = 'Unassigned'
      continue
    }
    if (instanceExists.locationId) {
      item.type = `World (${instanceExists.location.name})`
      item.locationSlug = instanceExists.location.slugifiedName
    } else if (instanceExists.channelId) {
      item.type = 'Media'
      const channelExists = channels.find((channel) => channel.instanceId === instanceExists.id)
      if (!channelExists) {
        continue
      }
      if (instanceExists.locationId) {
        item.type = `Media (${instanceExists.location.name} - ${instanceExists.id})`
      } else {
        item.type = `Channel (${instanceExists.id})`
      }
    }
  }
}

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
