import { V1Pod, V1PodSpec, V1Service, V1ServiceSpec } from '@kubernetes/client-node'
import request from 'request'

import { BotPod, BotService, SpawnBotPod } from '@etherealengine/common/src/interfaces/AdminBot'
import { getState } from '@etherealengine/hyperflux'
import { Application } from '@etherealengine/server-core/declarations'
import config from '@etherealengine/server-core/src/appconfig'
import serverLogger, { logger } from '@etherealengine/server-core/src/ServerLogger'
import { ServerState } from '@etherealengine/server-core/src/ServerState'

const packageName = 'ee-bot'
const packageUrl = 'https://github.com/EtherealEngine/ee-bot'
const servicePort = 4000
let serviceIp = `${packageName}-service.default.svc.cluster.local`

export const getBotPodBody = (botid: string) => {
  const podSpec: V1PodSpec = {
    containers: [
      {
        name: 'npm-container',
        image: 'node:latest',
        command: ['bash', '-c', `git clone ${packageUrl} && cd ${packageName} && npm install && npm run dev`]
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
        port: servicePort,
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
  const serviceName = service.metadata?.name!
  if (k8DefaultClient) {
    try {
      const currservice = await getBotService(serviceName)
      if (currservice.length != 0) {
        console.log('service aleady exists skippping creation')
        serviceIp = currservice.spec?.clusterIP as string
        return
      }
      const deployService = await k8DefaultClient.createNamespacedService('default', service)
      serviceIp = deployService.body.spec?.clusterIP as string
      serverLogger.info(`${packageName} Service created! ip = ${serviceIp}`)
    } catch (e) {
      serverLogger.error(`${packageName} service creation failed`)
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
      const currservice = await getBotService(`${packageName}-service`)
      if (currservice.length == 0) {
        console.log('service does not exist skippping deletion')
        return
      }
      const destroyService = await k8DefaultClient.deleteNamespacedService(`${packageName}-service`, 'default')
      logger.info(`${packageName} Service destroyed!`)
    } catch (e) {
      serverLogger.error(`${packageName} service deletion failed`)
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
  const podName = pod.metadata?.name!
  logger.info(`trying to create bot pod with name ${podName}`)
  if (k8DefaultClient) {
    try {
      const currPod = await getBotPod(podName)
      if (currPod.length != 0) {
        console.log(`pod for id ${data.id} already exists skippping creation`)
        return
      }
      const deployPod = await k8DefaultClient.createNamespacedPod('default', pod)
      logger.info(`${packageName} Pod created!`)
    } catch (e) {
      serverLogger.error(`${packageName} pod creation failed`)
      serverLogger.error(e)
      return e
    }
  } else {
    console.log('k8s client not available!')
  }
}

export const deleteBodPod = async (data: any) => {
  logger.info(`trying to delete bot pod`)
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const currPod = await getBotPod(`${packageName}-pod-${data.id}`)
      if (currPod.length == 0) {
        console.log(`pod for ${data.id} does not exists skippping creation`)
        return
      }
      const destroyPod = await k8DefaultClient.deleteNamespacedPod(`${packageName}-pod-${data.id}`, 'default')
      logger.info(`${packageName} Pod deleted!`)
    } catch (e) {
      serverLogger.error(`${packageName} pod deletion failed`)
      serverLogger.error(e)
      return e
    }
  } else {
    console.log('k8s client not available!')
  }
}

export const getBotService = async (query = `${packageName}`) => {
  logger.info(`trying to get Service with query ${query}`)
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const serviceResult = await k8DefaultClient.listNamespacedService(
        'default',
        undefined,
        undefined,
        undefined,
        `metadata.name=${query}`
      ) // filter metadta label by prefix
      const services: BotService[] = []
      for (const service of serviceResult.body.items) {
        services.push({
          name: service.metadata?.name!,
          ip: service.spec?.clusterIP as string
        })
      }
      logger.info(services)
      return services
    } catch (e) {
      serverLogger.error(`${packageName} service fetch failed`)
      serverLogger.error(e)
      return e
    }
  } else {
    console.log('k8s client not available!')
  }
}

export const getBotPod = async (query = `${packageName}`) => {
  logger.info(`trying to get Pod with query ${query}`)
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  if (k8DefaultClient) {
    try {
      const podsResult = await k8DefaultClient.listNamespacedPod(
        'default',
        undefined,
        undefined,
        undefined,
        `metadata.name=${query}`
      ) // filter metadta label by prefix
      const pods: BotPod[] = []
      for (const pod of podsResult.body.items) {
        pods.push({
          name: pod.metadata!.name!,
          status: pod.status!.phase!,
          ip: pod.status!.podIP!
        })
      }
      logger.info(pods)
      return pods
    } catch (e) {
      serverLogger.error(`${packageName} pod fetch failed`)
      serverLogger.error(e)
      return e
    }
  } else {
    console.log('k8s client not available!')
  }
}

export const callBotApi = async (data) => {
  const k8DefaultClient = getState(ServerState).k8DefaultClient
  const pod = getBotPodBody(data.id)
  const podName = pod.metadata!.name!
  if (k8DefaultClient) {
    try {
      const currPod = await getBotPod(podName)
      if (currPod.length == 0) {
        console.log(`pod for id ${data.id} doesnt exist skipping API call`)
        return
      }
      const endpoint: string = data.endpoint
      const method: string = data.method.toUpperCase()
      const requestBody = data.json
      const options = {
        url: `http://${serviceIp}:${servicePort}${endpoint}`,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        json: requestBody
      }

      request(options, (error, response, body) => {
        if (error) {
          serverLogger.error(error)
        } else {
          serverLogger.info(options.url, body)
          return response
        }
      })
    } catch (e) {
      serverLogger.error(`${packageName} run code failed`)
      serverLogger.error(e)
      return e
    }
  }
}
