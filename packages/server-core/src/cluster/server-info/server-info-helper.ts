import * as k8s from '@kubernetes/client-node'
import { Op } from 'sequelize'

import { Channel } from '@etherealengine/common/src/interfaces/Channel'
import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import {
  ServerContainerInfo,
  ServerInfoInterface,
  ServerPodInfo
} from '@etherealengine/common/src/interfaces/ServerInfo'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'

export const getServerInfo = async (app: Application): Promise<ServerInfoInterface[]> => {
  let serverInfo: ServerInfoInterface[] = []

  try {
    logger.info('Attempting to check k8s server info')

    if (app.k8DefaultClient) {
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
        `etherealengine/release=${config.server.releaseName},etherealengine/projectUpdater=true`,
        'projectUpdate',
        'Project Updater',
        app
      )
      serverInfo.push(projectUpdatePods)
    }

    // if (app.k8AgonesClient) {
    //   const instancePods = await getGameserversData(`agones.dev/fleet=${config.server.releaseName}-instanceserver`, 'instance', 'Instance', app)
    //   serverInfo.push(instancePods)
    // }
  } catch (e) {
    logger.error(e)
    return e
  }

  return serverInfo
}

export const removePod = async (app: Application, podName: string): Promise<ServerPodInfo | undefined> => {
  try {
    logger.info(`Attempting to remove k8s pod ${podName}`)

    if (app.k8DefaultClient) {
      const podsResponse = await app.k8DefaultClient.deleteNamespacedPod(podName, 'default')
      const pod = getServerPodInfo(podsResponse.body)

      return pod
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
  let pods: ServerPodInfo[] = []

  try {
    const podsResponse = await app.k8DefaultClient.listNamespacedPod(
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

const getGameserversData = async (labelSelector: string, id: string, label: string, app: Application) => {
  let gameservers: ServerPodInfo[] = []

  try {
    const gameserversResponse = await app.k8AgonesClient.listNamespacedCustomObject(
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
    age: item.status?.startTime,
    containers: getServerContainerInfo(item.status?.containerStatuses!)
  } as ServerPodInfo
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
    } as ServerContainerInfo
  })
}

const populateInstanceServerType = async (app: Application, items: ServerPodInfo[]) => {
  if (items.length === 0) {
    return
  }

  const instances = (await app.service('instance').Model.findAll({
    where: {
      ended: false
    },
    include: [
      {
        model: app.service('location').Model,
        required: false
      }
    ]
  })) as Instance[]

  if (instances.length === 0) {
    return
  }

  const channelInstances = instances.filter((item) => item.channelId)
  let channels: Channel[] = []

  if (channelInstances) {
    channels = (await app.service('channel').Model.findAll({
      where: {
        instanceId: {
          [Op.in]: channelInstances.map((item) => item.channelId)
        }
      }
    })) as Channel[]
  }

  for (const item of items) {
    const instanceExists = instances.find((instance) => instance.podName === item.name)

    item.instanceId = instanceExists ? instanceExists.id : ''
    item.currentUsers = instanceExists ? instanceExists.currentUsers : 0

    if (instanceExists && instanceExists.locationId) {
      item.type = `World (${instanceExists.location.name})`
      item.locationSlug = instanceExists.location.slugifiedName
    } else if (instanceExists && instanceExists.channelId) {
      item.type = 'Media'
      const channelExists = channels.find((channel) => channel.instanceId === instanceExists.id)
      if (channelExists && channelExists.channelType) {
        item.type = `Media (${channelExists.channelType})`
      }
    } else {
      item.type = 'Unassigned'
    }
  }
}
