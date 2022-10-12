import * as k8s from '@kubernetes/client-node'

import { ServerContainerInfo, ServerInfoInterface, ServerPodInfo } from '@xrengine/common/src/interfaces/ServerInfo'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'

export const getServerInfo = async (app: Application): Promise<ServerInfoInterface[]> => {
  let serverInfo: ServerInfoInterface[] = []

  //TODO: Remove this section
  const kc = new k8s.KubeConfig()
  kc.loadFromDefault()
  app.k8DefaultClient = kc.makeApiClient(k8s.CoreV1Api)
  app.k8AgonesClient = kc.makeApiClient(k8s.CustomObjectsApi)
  config.server.releaseName = 'dev'
  //TODO: End of remove this section

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
      serverInfo.push(instancePods)

      const analyticsPods = await getPodsData(
        `app.kubernetes.io/instance=${config.server.releaseName},app.kubernetes.io/component=analytics`,
        'analytics',
        'Analytics',
        app
      )
      serverInfo.push(analyticsPods)
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

const getPodsData = async (labelSelector: string, id: string, label: string, app: Application, nameFilter?: string) => {
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

    pods = getServerPodInfo(items)
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
    gameservers = getServerPodInfo((gameserversResponse.body as any).items)
  } catch (err) {
    logger.error('Failed to get pods info.', err)
  }

  return {
    id,
    label,
    pods: gameservers
  }
}

const getServerPodInfo = (items: k8s.V1Pod[]) => {
  return items.map((item) => {
    return {
      name: item.metadata?.name,
      status: item.status?.phase,
      age: item.status?.startTime,
      containers: getServerContainerInfo(item.status?.containerStatuses!)
    } as ServerPodInfo
  })
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
      restarts: item.restartCount
    } as ServerContainerInfo
  })
}
