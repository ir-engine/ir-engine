import { V1Pod, V1PodSpec, V1Service, V1ServiceSpec } from '@kubernetes/client-node'

import { BotPod, SpawnBotPod } from '@etherealengine/common/src/interfaces/AdminBot'
import { getState } from '@etherealengine/hyperflux'
import { Application } from '@etherealengine/server-core/declarations'
import config from '@etherealengine/server-core/src/appconfig'
import serverLogger from '@etherealengine/server-core/src/ServerLogger'
import { ServerState } from '@etherealengine/server-core/src/ServerState'

const packageName = 'ee-bot'
const packageUrl = 'https://github.com/EtherealEngine/ee-bot'
export const getBotPodBody = (botid: string) => {
  const podSpec: V1PodSpec = {
    containers: [
      {
        name: 'npm-container',
        image: 'node:latest',
        command: ['bash', '-c', `git clone ${packageUrl} && cd ${packageName} && npm install`]
      }
    ]
  }

  const pod: V1Pod = {
    metadata: {
      name: `${packageName}-pod-${botid}`,
      labels: {
        app: packageName
      }
    },
    spec: podSpec
  }
  return pod
}
export const getBotServiceBody = () => {
  const serviceSpec: V1ServiceSpec = {
    type: 'ClusterIP',
    ports: [
      {
        name: 'http',
        port: 8080,
        targetPort: 3000
      }
    ],
    selector: {
      app: packageName
    }
  }
  const service: V1Service = {
    metadata: {
      name: `${packageName}-service`
    },
    spec: serviceSpec
  }
  return service
}

export const createBotService = async () => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  const service = getBotServiceBody()
  if (k8DefaultClient) {
    try {
      const deployService = await k8DefaultClient.createNamespacedService('default', service)
      console.log('Bot Service created!')
    } catch (e) {
      serverLogger.error(e)
      return e
    }
  } else {
    console.log('k8s client not available!')
  }
}

export const deleteBotService = async () => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const destroyService = await k8DefaultClient.deleteNamespacedService(`${packageName}-service`, 'default')
      console.log('Bot Service destroyed!')
    } catch (e) {
      serverLogger.error(e)
      return e
    }
  } else {
    console.log('k8s client not available!')
  }
}

export const createBotPod = async (data: any) => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  const pod = getBotPodBody(data.id)
  if (k8DefaultClient) {
    try {
      const deployPod = await k8DefaultClient.createNamespacedPod('default', pod)
      console.log('Bot Pod created!')
    } catch (e) {
      serverLogger.error(e)
      return e
    }
  } else {
    console.log('k8s client not available!')
  }
}

export const deleteBodPod = async (data: any) => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const destroyPod = await k8DefaultClient.deleteNamespacedPod(`${packageName}-pod-${data.id}`, 'default')
      console.log('Bot Pod deleted!')
    } catch (e) {
      serverLogger.error(e)
      return e
    }
  } else {
    console.log('k8s client not available!')
  }
}

export const getBotPod = async () => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const jobNamePrefix = `${packageName}`
      const podsResult = await k8DefaultClient.listNamespacedPod(
        'default',
        undefined,
        undefined,
        undefined,
        `name=${jobNamePrefix}`
      ) // filter metadta label by prefix
      const pods: BotPod[] = []
      for (const pod of podsResult.body.items) {
        pods.push({
          name: pod.metadata!.name!,
          status: pod.status!.phase!
        })
      }
      return pods
    } catch (e) {
      serverLogger.error(e)
      return e
    }
  } else {
    console.log('k8s client not available!')
  }
}
