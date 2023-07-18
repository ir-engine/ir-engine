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

import detect from 'detect-port'
import { createWorker } from 'mediasoup'
import {
  DataConsumer,
  DataConsumerOptions,
  DataProducer,
  DataProducerOptions,
  MediaKind,
  Router,
  RtpCodecCapability,
  RtpParameters,
  SctpStreamParameters,
  Transport,
  WebRtcServer,
  WebRtcTransport,
  Worker
} from 'mediasoup/node/lib/types'
import os from 'os'
import { Spark } from 'primus'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { DataChannelType } from '@etherealengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import {
  dataChannelRegistry,
  MediaStreamAppData,
  MediaTagType
} from '@etherealengine/engine/src/networking/NetworkState'
import { getState } from '@etherealengine/hyperflux'
import config from '@etherealengine/server-core/src/appconfig'
import { localConfig, sctpParameters } from '@etherealengine/server-core/src/config'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'
import { ServerState } from '@etherealengine/server-core/src/ServerState'
import { WebRtcTransportParams } from '@etherealengine/server-core/src/types/WebRtcTransportParams'

import { InstanceServerState } from './InstanceServerState'
import { getUserIdFromPeerID } from './NetworkFunctions'
import {
  ConsumerExtension,
  ProducerExtension,
  SocketWebRTCServerNetwork,
  WebRTCTransportExtension
} from './SocketWebRTCServerFunctions'

const logger = multiLogger.child({ component: 'instanceserver:webrtc' })

const portsInUse: number[] = []

const getNewOffset = async (ipAddress, startPort, i, offset) => {
  const inUse = await detect(startPort + i + offset, ipAddress)
  if (inUse !== startPort + i + offset || portsInUse.indexOf(startPort + i + offset) >= 0)
    return getNewOffset(ipAddress, startPort, i, offset + 1)
  else return offset
}

export async function startWebRTC() {
  logger.info('Starting WebRTC Server.')
  // Initialize roomstate
  const cores = os.cpus()
  const routers = { instance: [] } as { instance: Router[]; [channelTypeAndChannelID: string]: Router[] }
  const workers = [] as Worker[]
  //This is used in case ports in the range to use are in use by something else
  let offset = 0
  for (let i = 0; i < cores.length; i++) {
    const newWorker = await createWorker({
      logLevel: 'debug',
      rtcMinPort: localConfig.mediasoup.worker.rtcMinPort,
      rtcMaxPort: localConfig.mediasoup.worker.rtcMaxPort,
      // dtlsCertificateFile: serverConfig.server.certPath,
      // dtlsPrivateKeyFile: serverConfig.server.keyPath,
      logTags: ['sctp']
    })

    const webRtcServerOptions = JSON.parse(JSON.stringify(localConfig.mediasoup.webRtcServerOptions))
    offset = await getNewOffset(
      webRtcServerOptions.listenInfos[0].ipAddress,
      webRtcServerOptions.listenInfos[0].port,
      i,
      offset
    )
    for (const listenInfo of webRtcServerOptions.listenInfos) listenInfo.port += i + offset
    portsInUse.push(webRtcServerOptions.listenInfos[0].port)
    newWorker.appData.webRtcServer = await newWorker.createWebRtcServer(webRtcServerOptions)

    newWorker.on('died', (err) => {
      logger.fatal(err, 'mediasoup worker died (this should never happen)')
      process.exit(1)
    })

    logger.info('Created Mediasoup worker.')

    const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[]
    const newRouter = await newWorker.createRouter({ mediaCodecs, appData: { worker: newWorker } })
    routers.instance.push(newRouter)
    logger.info('Worker created router.')
    workers.push(newWorker)
  }
  return { routers, workers }
}

/**
 * Creates a new WebRTC transport for the given data channel.
 */
export const createOutgoingDataProducer = async (network: SocketWebRTCServerNetwork, dataChannel: DataChannelType) => {
  if (network.outgoingDataProducers[dataChannel]) return

  logger.info('createOutgoingDataProducer %o', dataChannel)

  const outgoingDataProducer = await network.outgoingDataTransport.produceData({
    label: dataChannel,
    protocol: 'raw',
    // sctpStreamParameters: {
    //   ordered: sctpStreamParameters.ordered
    // },
    appData: {
      peerID: 'outgoingProducer'
    }
  })

  const currentRouter = network.routers.instance[0]

  await Promise.all(
    network.routers.instance.map(async (router) => {
      if (router.id !== currentRouter.id)
        return currentRouter.pipeToRouter({ dataProducerId: outgoingDataProducer.id, router: router })
      else return Promise.resolve()
    })
  )

  network.outgoingDataProducers[dataChannel] = outgoingDataProducer
}

/**
 * Sends all current producers to a new peer
 * @param network
 * @param spark
 * @param selfPeerID
 * @param userIds
 * @param channelType
 * @param channelId
 */
export const sendCurrentProducers = async (
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  selfPeerID: PeerID,
  userIds: string[],
  channelType: string,
  channelId?: string
): Promise<void> => {
  for (const [peerID, client] of network.peers) {
    if (
      peerID === selfPeerID ||
      (userIds.length > 0 && !userIds.includes(client.userId)) ||
      !client.media ||
      !client.peerID
    )
      continue

    for (const [dataChannel, peerMedia] of Object.entries(client.media)) {
      if (peerMedia.channelType !== channelType || peerMedia.channelId !== channelId || peerMedia.paused) continue
      // logger.info(`Sending producer ${peerMedia.producerId} to peer "${peerID}".`)
      spark.write({
        type: MessageTypes.WebRTCCreateProducer.toString(),
        data: {
          peerID,
          mediaTag: dataChannel,
          producerId: peerMedia.producerId,
          channelType,
          channelId
        }
      })
    }
  }
}

export const handleWebRtcConsumeData = async (
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data: {
    label: DataChannelType
  },
  messageId?: string
) => {
  logger.info('handleWebRtcConsumeData %o', data)
  const peer = network.peers.get(peerID)!
  if (!peer) {
    logger.warn('No peer found for peerID: ' + peerID)
    spark.write({ type: MessageTypes.WebRTCConsumeData.toString(), data: { error: 'peer ID not found' } })
    return
  }

  const { label } = data
  await createOutgoingDataProducer(network, label)

  const userId = getUserIdFromPeerID(network, peerID)!
  logger.info('Data Consumer being created on server by client: ' + userId)

  if (peer.outgoingDataConsumers!.has(label)) {
    return logger.info('Data consumer already exists for label: ' + label)
  }

  const newTransport = peer.instanceRecvTransport as Transport
  if (!newTransport) {
    return spark.write({ type: MessageTypes.WebRTCConsumeData.toString(), data: { error: 'transport did not exist' } })
  }

  try {
    const outgoingDataProducer = network.outgoingDataProducers[label]
    const dataConsumer = await newTransport.consumeData({
      dataProducerId: outgoingDataProducer.id,
      appData: { peerID, transportId: newTransport.id }
    })

    dataConsumer.on('dataproducerclose', () => {
      dataConsumer.close()
      if (network.peers.has(peerID)) network.peers.get(peerID)!.outgoingDataConsumers!.delete(label)
    })

    const peer = network.peers.get(peerID)

    logger.info('Setting data consumer to room state.')
    if (!peer) {
      spark.write({
        type: MessageTypes.WebRTCConsumeData.toString(),
        id: messageId,
        data: { error: 'client no longer exists' }
      })
      return
    }

    peer.outgoingDataConsumers!.set(label, dataConsumer)

    // Data consumers are all consuming the single producer that outputs from the server's message queue
    spark.write({
      type: MessageTypes.WebRTCConsumeData.toString(),
      id: messageId,
      data: {
        dataProducerId: '',
        sctpStreamParameters: dataConsumer.sctpStreamParameters,
        label: dataConsumer.label,
        id: dataConsumer.id,
        appData: dataConsumer.appData,
        protocol: 'raw'
      } as DataConsumerOptions
    })
  } catch (err) {
    logger.error(err, `Consume data error: ${err.message}.`)
    logger.info('Transport that could not be consumed: %o', newTransport)
    spark.write({
      type: MessageTypes.WebRTCConsumeData.toString(),
      id: messageId,
      data: { error: 'transport did not exist' }
    })
  }
}

export async function closeDataProducer(network, dataProducer): Promise<void> {
  network.dataProducers.delete(dataProducer.id)
  logger.info("data producer's transport closed: " + dataProducer.id)
  dataProducer.close()
  const peer = network.peers.get(dataProducer.appData.peerID)
  if (peer) peer.dataProducers!.delete(dataProducer.id)
}

export async function closeTransport(
  network: SocketWebRTCServerNetwork,
  transport: WebRTCTransportExtension
): Promise<void> {
  logger.info(`Closing transport id "${transport.id}", appData: %o`, transport.appData)
  // our producer and consumer event handlers will take care of
  // calling closeProducer() and closeConsumer() on all the producers
  // and consumers associated with this transport
  const dataProducers = (transport as any).dataProducers
  dataProducers?.forEach(async (dataProducer) => await closeDataProducer(network, dataProducer))
  const producers = (transport as any).producers
  producers?.forEach(async (producer) => await closeProducer(network, producer))
  if (transport && typeof transport.close === 'function') {
    await transport.close()
    delete network.mediasoupTransports[transport.id]
  }
}

export async function closeProducer(network: SocketWebRTCServerNetwork, producer: ProducerExtension): Promise<void> {
  logger.info(`Closing producer id "${producer.id}", appData: %o`, producer.appData)
  await producer.close()

  network.producers = network.producers.filter((p) => p.id !== producer.id)
  const appData = producer.appData as MediaStreamAppData

  if (network.peers.has(appData.peerID)) {
    delete network.peers.get(appData.peerID)!.media![producer.appData.mediaTag]
  }
}

export async function closeProducerAndAllPipeProducers(
  network: SocketWebRTCServerNetwork,
  producer: ProducerExtension
): Promise<void> {
  logger.info(`Closing producer id "${producer?.id}" and all pipe producers, appData: %o`, producer?.appData)
  if (producer != null) {
    // remove this producer from our roomState.producers list
    network.producers = network.producers.filter((p) => p.id !== producer.id)

    // finally, close the original producer
    await producer.close()

    // remove this producer from our roomState.producers list
    network.producers = network.producers.filter((p) => p.id !== producer.id)
    network.consumers = network.consumers.filter(
      (c) => !(c.appData.mediaTag === producer.appData.mediaTag && c.producerId === producer.id)
    )

    // remove this track's info from our roomState...mediaTag bookkeeping
    delete network.peers.get(producer.appData.peerID)?.media![producer.appData.mediaTag]
  }
}

export async function closeConsumer(network: SocketWebRTCServerNetwork, consumer: ConsumerExtension): Promise<void> {
  await consumer.close()

  network.consumers = network.consumers.filter((c) => c.id !== consumer.id)

  for (const [, client] of network.peers) {
    if (client.spark) {
      client.spark!.write({ type: MessageTypes.WebRTCCloseConsumer.toString(), data: consumer.id })
    }
  }

  delete network.peers.get(consumer.appData.peerID)?.consumerLayers![consumer.id]
}

export async function createWebRtcTransport(
  network: SocketWebRTCServerNetwork,
  { peerID, direction, sctpCapabilities, channelType, channelId }: WebRtcTransportParams
): Promise<WebRtcTransport> {
  const { listenIps, initialAvailableOutgoingBitrate } = localConfig.mediasoup.webRtcTransport
  const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[]
  if (channelType !== 'instance') {
    if (!network.routers[`${channelType}:${channelId}`]) {
      network.routers[`${channelType}:${channelId}`] = [] as any
      await Promise.all(
        network.workers.map(async (worker) => {
          const newRouter = await worker.createRouter({ mediaCodecs, appData: { worker } })
          network.routers[`${channelType}:${channelId}`].push(newRouter)
          return Promise.resolve()
        })
      )
    }
    logger.info(`Worker created router for channel ${channelType}:${channelId}`)
  }

  const routerList =
    channelType === 'instance' && !channelId ? network.routers.instance : network.routers[`${channelType}:${channelId}`]

  const dumps: any = await Promise.all(routerList.map(async (item) => await item.dump()))
  const sortedDumps = dumps.sort((a, b) => a.transportIds.length - b.transportIds.length)
  const selectedrouter = routerList.find((item) => item.id === sortedDumps[0].id)!

  if (!selectedrouter) {
    logger.error('no router selected', routerList, dumps, sortedDumps)
    throw new Error('Failed to find a router to create a transport on')
  }

  return selectedrouter?.createWebRtcTransport({
    webRtcServer: (selectedrouter.appData.worker as Worker).appData!.webRtcServer as WebRtcServer,
    enableUdp: true,
    enableTcp: false,
    preferUdp: true,
    enableSctp: true,
    numSctpStreams: sctpCapabilities.numStreams,
    initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
    appData: { peerID, channelType, channelId, clientDirection: direction }
  })
}

export async function createInternalDataConsumer(
  network: SocketWebRTCServerNetwork,
  dataProducer: DataProducer,
  peerID: PeerID
): Promise<DataConsumer | null> {
  try {
    const consumer = await network.outgoingDataTransport.consumeData({
      dataProducerId: dataProducer.id,
      appData: { peerID, transportId: network.outgoingDataTransport.id },
      maxPacketLifeTime: dataProducer.sctpStreamParameters!.maxPacketLifeTime,
      maxRetransmits: dataProducer.sctpStreamParameters!.maxRetransmits,
      ordered: false
    })
    consumer.on('message', (message) => {
      const dataChannelFunctions = dataChannelRegistry.get(dataProducer.label as DataChannelType)
      if (dataChannelFunctions) {
        for (const func of dataChannelFunctions) func(network, dataProducer.label as DataChannelType, peerID, message)
      }
    })
    return consumer
  } catch (err) {
    logger.error(err, 'Error creating internal data consumer. dataProducer: %o', dataProducer)
  }
  return null
}

export async function handleWebRtcTransportCreate(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data: WebRtcTransportParams,
  messageId: string
): Promise<any> {
  try {
    const { direction, sctpCapabilities, channelType, channelId } = Object.assign(data)

    const existingTransports = network.mediasoupTransports.filter(
      (t) =>
        t.appData.peerID === peerID &&
        t.appData.direction === direction &&
        (channelType === 'instance'
          ? t.appData.channelType === 'instance'
          : t.appData.channelType === channelType && t.appData.channelId === channelId)
    )
    await Promise.all(existingTransports.map((t) => closeTransport(network, t)))
    const newTransport: WebRtcTransport = await createWebRtcTransport(network, {
      peerID: peerID,
      direction,
      sctpCapabilities,
      channelType,
      channelId
    })

    if (!newTransport)
      spark.write({
        type: MessageTypes.WebRTCTransportCreate.toString(),
        data: { error: 'No transport was created' },
        id: messageId
      })

    await newTransport.setMaxIncomingBitrate(localConfig.mediasoup.webRtcTransport.maxIncomingBitrate)

    network.mediasoupTransports[newTransport.id] = newTransport

    // Distinguish between send and create transport of each client w.r.t producer and consumer (data or mediastream)
    if (direction === 'recv') {
      if (channelType === 'instance' && network.peers.has(peerID)) {
        network.peers.get(peerID)!.instanceRecvTransport = newTransport
      } else if (channelType !== 'instance' && channelId) {
        network.peers.get(peerID)!.channelRecvTransport = newTransport
      }
    } else if (direction === 'send') {
      if (channelType === 'instance' && network.peers.has(peerID)) {
        network.peers.get(peerID)!.instanceSendTransport = newTransport
      } else if (channelType !== 'instance' && channelId && network.peers.has(peerID)) {
        network.peers.get(peerID)!.channelSendTransport = newTransport
      }
    }

    const { id, iceParameters, iceCandidates, dtlsParameters } = newTransport

    if (config.kubernetes.enabled) {
      const serverState = getState(ServerState)
      const instanceServerState = getState(InstanceServerState)

      const serverResult = await serverState.k8AgonesClient.listNamespacedCustomObject(
        'agones.dev',
        'v1',
        'default',
        'gameservers'
      )
      const thisGs = (serverResult?.body! as any).items.find(
        (server) => server.metadata.name === instanceServerState.instanceServer.objectMeta.name
      )

      for (let [index, candidate] of iceCandidates.entries()) {
        iceCandidates[index].port = thisGs.spec?.ports?.find(
          (portMapping) => portMapping.containerPort === candidate.port
        ).hostPort
      }
    }
    const clientTransportOptions = {
      id,
      sctpParameters: {
        ...sctpParameters,
        OS: sctpCapabilities.numStreams.OS,
        MIS: sctpCapabilities.numStreams.MIS
      },
      iceParameters,
      iceCandidates,
      dtlsParameters
    }

    newTransport.observer.on('dtlsstatechange', (dtlsState) => {
      if (dtlsState === 'closed') closeTransport(network, newTransport as unknown as WebRTCTransportExtension)
    })
    // newTransport.observer.on('newproducer', sendNewProducer(network, spark, peerID, channelType, channelId) as any)
    spark.write({
      type: MessageTypes.WebRTCTransportCreate.toString(),
      data: { transportOptions: clientTransportOptions },
      id: messageId
    })
  } catch (err) {
    logger.error(err)
    spark.write({ type: MessageTypes.WebRTCTransportCreate.toString(), data: { error: err }, id: messageId })
  }
}

export async function handleWebRtcProduceData(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data: {
    transportId: string
    sctpStreamParameters: SctpStreamParameters
    protocol: string
    label: DataChannelType
    appData: any
  },
  messageId?: string
): Promise<any> {
  try {
    const userId = getUserIdFromPeerID(network, peerID)
    if (!userId) {
      logger.info('userId could not be found for sparkID ' + peerID)
      return
    }
    if (typeof data.label !== 'string' || !dataChannelRegistry.has(data.label)) {
      const errorMessage = 'Invalid data producer label (i.e. channel name) provided:' + data.label
      logger.error(errorMessage)
      return spark.write({
        type: MessageTypes.WebRTCProduceData.toString(),
        data: { error: errorMessage },
        id: messageId
      })
    }

    if (!network.peers.has(peerID)) {
      const errorMessage = `Client no longer exists for userId "${userId}".`
      logger.error(errorMessage)
      return spark.write({
        type: MessageTypes.WebRTCProduceData.toString(),
        data: { error: errorMessage },
        id: messageId
      })
    }
    logger.info(`peerID "${peerID}", Data channel "${data.label}" %o: `, data)
    const transport = network.mediasoupTransports[data.transportId]
    if (transport) {
      try {
        const { transportId, sctpStreamParameters, label, protocol, appData } = data
        const options: DataProducerOptions = {
          label,
          protocol,
          sctpStreamParameters,
          appData: { ...(appData || {}), peerID, transportId }
        }
        logger.info('Data producer params: %o', options)
        const dataProducer = await transport.produceData(options)
        network.dataProducers.set(dataProducer.id, dataProducer)
        logger.info(`User ${userId} producing data on ${label}`)
        if (network.peers.has(peerID)) {
          network.peers.get(peerID)!.dataProducers!.set(dataProducer.id, dataProducer)

          const currentRouter = network.routers.instance.find((router) => router.id === transport.internal.routerId)!

          await Promise.all(
            network.routers.instance.map(async (router) => {
              if (router.id !== transport.internal.routerId)
                return currentRouter.pipeToRouter({
                  dataProducerId: dataProducer.id,
                  router: router
                })
            })
          )

          // if our associated transport closes, close ourself, too
          dataProducer.on('transportclose', () => closeDataProducer(network, dataProducer))
          const internalConsumer = await createInternalDataConsumer(network, dataProducer, peerID)
          if (internalConsumer) {
            if (!network.peers.has(peerID)) {
              logger.error('Client no longer exists.')
              return spark.write({
                type: MessageTypes.WebRTCProduceData.toString(),
                data: { error: 'Client no longer exists.' },
                id: messageId
              })
            }
            network.peers.get(peerID)!.incomingDataConsumers!.set(label, internalConsumer)
            // Possibly do stuff with appData here
            logger.info('Sending dataproducer id to client: ' + dataProducer.id)
            return spark.write({
              type: MessageTypes.WebRTCProduceData.toString(),
              data: { id: dataProducer.id },
              id: messageId
            })
          } else {
            logger.error('Invalid data producer.')
            return spark.write({
              type: MessageTypes.WebRTCProduceData.toString(),
              data: { error: 'Invalid data producer.' },
              id: messageId
            })
          }
        } else {
          logger.error('Client no longer exists.')
          return spark.write({
            type: MessageTypes.WebRTCProduceData.toString(),
            data: { error: 'Client no longer exists.' },
            id: messageId
          })
        }
      } catch (e) {
        logger.error(e, 'handleWebRtcProduceData')
        return spark.write({
          type: MessageTypes.WebRTCProduceData.toString(),
          data: { error: 'Unknown error' },
          id: messageId
        })
      }
    } else {
      logger.error('Invalid transport.')
      return spark.write({
        type: MessageTypes.WebRTCProduceData.toString(),
        data: { error: 'Invalid transport.' },
        id: messageId
      })
    }
  } catch (err) {
    logger.error(err)
    spark.write({ type: MessageTypes.WebRTCProduceData.toString(), data: { error: err }, id: messageId })
  }
}

export async function handleWebRtcTransportClose(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
) {
  const { transportId } = data
  const transport = network.mediasoupTransports[transportId]
  if (transport) {
    await closeTransport(network, transport).catch((err) => logger.error(err, 'Error closing WebRTC transport.'))
  }
  spark.write({ type: MessageTypes.WebRTCTransportClose.toString(), data: { closed: true }, id: messageId })
}

export async function handleWebRtcTransportConnect(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
) {
  const { transportId, dtlsParameters } = data,
    transport = network.mediasoupTransports[transportId]
  if (transport) {
    const pending = network.transportsConnectPending[transportId] ?? transport.connect({ dtlsParameters })
    pending
      .then(() => {
        spark.write({ type: MessageTypes.WebRTCTransportConnect.toString(), data: { connected: true }, id: messageId })
      })
      .catch((err) => {
        logger.error(err, 'handleWebRtcTransportConnect, data: %o', data)
        spark.write({ type: MessageTypes.WebRTCTransportConnect.toString(), data: { connected: false }, id: messageId })
      })
    network.transportsConnectPending[transportId] = pending
  } else {
    logger.error('Invalid transport.')
    spark.write({
      type: MessageTypes.WebRTCTransportConnect.toString(),
      data: { error: 'invalid transport' },
      id: messageId
    })
  }
}

export async function handleWebRtcCloseProducer(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId
) {
  const { producerId } = data
  const producer = network.producers.find((p) => p.id === producerId)
  try {
    if (producer) {
      const hostClient = Array.from(network.peers.values()).find((peer) => {
        return peer.media && peer.media![producer.appData.mediaTag]?.producerId === producerId
      })!
      if (hostClient) {
        await closeProducerAndAllPipeProducers(network, producer)
        spark!.write({ type: MessageTypes.WebRTCCloseProducer.toString(), data: producerId, id: messageId })
        return
      }
      await closeProducer(network, producer)
      spark!.write({ type: MessageTypes.WebRTCCloseProducer.toString(), data: producerId, id: messageId })
      return
    }
  } catch (err) {
    logger.error(err, 'Error closing WebRTC producer.')
  }
  spark.write({ type: MessageTypes.WebRTCCloseProducer.toString(), data: { closed: true }, id: messageId })
}

type HandleWebRtcSendTrackData = {
  appData: MediaStreamAppData
  transportId: any
  kind: MediaKind
  rtpParameters: RtpParameters
  paused: boolean
}

export async function handleWebRtcSendTrack(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data: HandleWebRtcSendTrackData,
  messageId: string
) {
  const userId = getUserIdFromPeerID(network, peerID)
  const { transportId, kind, rtpParameters, paused = false, appData } = data
  const transport = network.mediasoupTransports[transportId]

  if (!transport) {
    logger.error('Invalid transport ID.')
    return spark.write({
      type: MessageTypes.WebRTCSendTrack.toString(),
      data: { error: 'Invalid transport ID.' },
      id: messageId
    })
  }

  try {
    const newProducerAppData = { ...appData, peerID, transportId } as MediaStreamAppData
    const existingProducer = await network.producers.find((producer) => producer.appData === newProducerAppData)
    if (existingProducer) await closeProducer(network, existingProducer)
    const producer = (await transport.produce({
      kind,
      rtpParameters,
      paused,
      appData: newProducerAppData
    })) as unknown as ProducerExtension

    const routers = network.routers[`${appData.channelType}:${appData.channelId}`]
    const currentRouter = routers.find((router) => router.id === transport?.internal.routerId)!

    await Promise.all(
      routers.map(async (router: Router) => {
        if (router.id !== transport?.internal.routerId) {
          return currentRouter.pipeToRouter({
            producerId: producer.id,
            router: router
          })
        }
      })
    )

    producer.on('transportclose', () => closeProducerAndAllPipeProducers(network, producer))

    if (!network.producers) {
      logger.warn('Media stream producers is undefined.')
    }
    network.producers?.push(producer)
    logger.info(`New Producer: peerID "${peerID}", Media stream "${appData.mediaTag}"`)

    if (userId && network.peers.has(peerID)) {
      network.peers.get(peerID)!.media![appData.mediaTag] = {
        paused,
        producerId: producer.id,
        globalMute: false,
        encodings: rtpParameters.encodings as any,
        channelType: appData.channelType,
        channelId: appData.channelId
      }
    }
    for (const [clientPeerID, client] of network.peers) {
      if (clientPeerID !== peerID && client.spark) {
        client.spark.write({
          type: MessageTypes.WebRTCCreateProducer.toString(),
          data: {
            peerID,
            mediaTag: appData.mediaTag,
            producerId: producer.id,
            channelType: appData.channelType,
            channelId: appData.channelId
          }
        })
      }
    }
    spark.write({ type: MessageTypes.WebRTCSendTrack.toString(), data: { id: producer.id }, id: messageId })
  } catch (err) {
    logger.error(err, 'Error with sendTrack.')
    spark.write({
      type: MessageTypes.WebRTCSendTrack.toString(),
      data: { error: 'Error with sendTrack: ' + err },
      id: messageId
    })
  }
}

type HandleWebRtcReceiveTrackData = {
  mediaPeerId: PeerID
  mediaTag: MediaTagType
  rtpCapabilities: any
  channelType: string
  channelId: string
}

export async function handleWebRtcReceiveTrack(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data: HandleWebRtcReceiveTrackData,
  messageId: string
): Promise<any> {
  const { mediaPeerId, mediaTag, rtpCapabilities, channelType, channelId } = data
  const producer = network.producers.find(
    (p) =>
      p.appData.mediaTag === mediaTag &&
      p.appData.peerID === mediaPeerId &&
      (channelType === 'instance'
        ? p.appData.channelType === channelType
        : p.appData.channelType === channelType && p.appData.channelId === channelId)
  )

  const transport = Object.values(network.mediasoupTransports).find(
    (t) =>
      t.appData.peerID === peerID &&
      t.appData.clientDirection === 'recv' &&
      (channelType === 'instance'
        ? t.appData.channelType === channelType
        : t.appData.channelType === channelType && t.appData.channelId === channelId) &&
      !t.closed
  )!
  // @todo: the 'any' cast here is because WebRtcTransport.internal is protected - we should see if this is the proper accessor
  const router = network.routers[`${channelType}:${channelId}`].find(
    (router) => router.id === transport?.internal.routerId
  )
  if (!producer || !router || !router.canConsume({ producerId: producer.id, rtpCapabilities })) {
    const msg = `Client cannot consume ${mediaPeerId}:${mediaTag}, ${producer?.id}`
    logger.error(`recv-track: ${peerID} ${msg}`)
    return spark.write({ type: MessageTypes.WebRTCReceiveTrack.toString(), data: { error: msg }, id: messageId })
  }

  if (transport) {
    try {
      const consumer = (await transport.consume({
        producerId: producer.id,
        rtpCapabilities,
        paused: true, // see note above about always starting paused
        appData: { peerID, mediaPeerId, mediaTag, channelType: channelType, channelId: channelId }
      })) as unknown as ConsumerExtension

      // we need both 'transportclose' and 'producerclose' event handlers,
      // to make sure we close and clean up consumers in all circumstances
      consumer.on('transportclose', () => {
        logger.info(`Consumer's transport closed, consumer.id: "${consumer.id}".`)
        closeConsumer(network, consumer)
      })
      consumer.on('producerclose', () => {
        logger.info(`Consumer's producer closed, consumer.id: "${consumer.id}".`)
        closeConsumer(network, consumer)
      })

      // stick this consumer in our list of consumers to keep track of
      network.consumers.push(consumer)

      if (network.peers.has(peerID)) {
        network.peers.get(peerID)!.consumerLayers![consumer.id] = {
          currentLayer: null,
          clientSelectedLayer: null
        }
      }

      // update above data structure when layer changes.
      consumer.on('layerschange', (layers) => {
        if (network.peers.has(peerID) && network.peers.get(peerID)!.consumerLayers![consumer.id]) {
          network.peers.get(peerID)!.consumerLayers![consumer.id].currentLayer = layers && layers.spatialLayer
        }
      })

      spark.write({
        type: MessageTypes.WebRTCReceiveTrack.toString(),
        data: {
          producerId: producer.id,
          id: consumer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          type: consumer.type,
          producerPaused: consumer.producerPaused
        },
        id: messageId
      })
    } catch (err) {
      logger.error(err, 'Error consuming transport %o.', transport)
      spark.write({
        type: MessageTypes.WebRTCReceiveTrack.toString(),
        data: { error: 'Transport to consume no longer exists.' },
        id: messageId
      })
    }
  } else {
    spark.write({
      type: MessageTypes.WebRTCReceiveTrack.toString(),
      data: {
        id: null
      },
      id: messageId
    })
  }
}

export async function handleWebRtcPauseConsumer(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
): Promise<any> {
  const { consumerId } = data
  const consumer = network.consumers.find((c) => c.id === consumerId)
  if (consumer) {
    if (typeof consumer.pause === 'function' && !consumer.closed && !(consumer as any)._closed) await consumer.pause()
    spark.write({ type: MessageTypes.WebRTCPauseConsumer.toString(), data: consumer.id })
  }
  spark.write({ type: MessageTypes.WebRTCPauseConsumer.toString(), data: { paused: true }, id: messageId })
}

export async function handleWebRtcResumeConsumer(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
): Promise<any> {
  const { consumerId } = data
  const consumer = network.consumers.find((c) => c.id === consumerId)
  if (consumer) {
    if (typeof consumer.resume === 'function' && !consumer.closed && !(consumer as any)._closed) await consumer.resume()
    spark.write({ type: MessageTypes.WebRTCResumeConsumer.toString(), data: consumer.id })
  }
  spark.write({ type: MessageTypes.WebRTCResumeConsumer.toString(), data: consumer.id, id: messageId })
}

export async function handleWebRtcCloseConsumer(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
): Promise<any> {
  const { consumerId } = data
  const consumer = network.consumers.find((c) => c.id === consumerId)
  if (consumer) {
    await closeConsumer(network, consumer)
  }
  // this is to reply to the request, which needs to be resolved
  spark.write({ type: MessageTypes.WebRTCCloseConsumer.toString(), id: messageId })
}

export async function handleWebRtcConsumerSetLayers(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
): Promise<any> {
  const { consumerId, spatialLayer } = data
  const consumer = network.consumers.find((c) => c.id === consumerId)!
  if (!consumer)
    return spark.write({
      type: MessageTypes.WebRTCConsumerSetLayers.toString(),
      data: { layersSet: false },
      id: messageId
    })
  logger.info('consumer-set-layers: %o, %o', spatialLayer, consumer.appData)
  try {
    await consumer.setPreferredLayers({ spatialLayer })
    spark.write({ type: MessageTypes.WebRTCConsumerSetLayers.toString(), data: { layersSet: true }, id: messageId })
  } catch (err) {
    logger.warn(err)
    return spark.write({
      type: MessageTypes.WebRTCConsumerSetLayers.toString(),
      data: { layersSet: false },
      id: messageId
    })
  }
}

export async function handleWebRtcResumeProducer(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
): Promise<any> {
  const { producerId } = data
  const producer = network.producers.find((p) => p.id === producerId)
  logger.info('resume-producer: %o', producer?.appData)
  if (producer) {
    if (typeof producer.resume === 'function' && !producer.closed && !(producer as any)._closed) await producer.resume()
    // await producer.resume();
    if (peerID && network.peers.has(peerID)) {
      network.peers.get(peerID)!.media![producer.appData.mediaTag as any].paused = false
      network.peers.get(peerID)!.media![producer.appData.mediaTag as any].globalMute = false
      // const hostClient = Array.from(network.peers.entries()).find(([, client]) => {
      //   return client.media && client.media![producer.appData.mediaTag as any]?.producerId === producerId
      // })!
      // if (hostClient && hostClient[1])
      //   hostClient[1].spark!.write({ type: MessageTypes.WebRTCResumeProducer.toString(), data: producer.id })
    }
    for (const [, client] of network.peers) {
      if (client && client.spark)
        client.spark.write({ type: MessageTypes.WebRTCResumeProducer.toString(), data: producer.id })
    }
  }
  spark.write({ type: MessageTypes.WebRTCResumeProducer.toString(), data: producer.id, id: messageId })
}

export async function handleWebRtcPauseProducer(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
): Promise<any> {
  const { producerId, globalMute } = data
  const producer = network.producers.find((p) => p.id === producerId)
  if (producer) {
    if (typeof producer.pause === 'function' && !producer.closed && !(producer as any)._closed) await producer.pause()
    if (peerID && network.peers.has(peerID) && network.peers.get(peerID)!.media![producer.appData.mediaTag as any]) {
      network.peers.get(peerID)!.media![producer.appData.mediaTag as any].paused = true
      network.peers.get(peerID)!.media![producer.appData.mediaTag as any].globalMute = globalMute || false
      // const hostClient = Array.from(network.peers.entries()).find(([, client]) => {
      //   return client.media && client.media![producer.appData.mediaTag as any]?.producerId === producerId
      // })!
      // if (hostClient && hostClient[1])
      //   hostClient[1].spark!.write({ type: MessageTypes.WebRTCPauseProducer.toString(), data: {producerId: producer.id, globalMute: true }})
    }
    for (const [, client] of network.peers) {
      if (client && client.spark)
        client.spark.write({
          type: MessageTypes.WebRTCPauseProducer.toString(),
          data: { producerId: producer.id, globalMute: globalMute || false }
        })
    }
  }
  spark.write({ type: MessageTypes.WebRTCPauseProducer.toString(), data: { paused: true }, id: messageId })
}

export async function handleWebRtcRequestCurrentProducers(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
): Promise<any> {
  const { userIds, channelType, channelId } = data
  await sendCurrentProducers(network, spark, peerID, userIds || [], channelType, channelId)
  spark.write({ type: MessageTypes.WebRTCRequestCurrentProducers.toString(), data: { requested: true }, id: messageId })
}

export async function handleWebRtcInitializeRouter(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
): Promise<any> {
  const { channelType, channelId } = data
  if (!(channelType === 'instance' && !channelId)) {
    const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[]
    if (!network.routers[`${channelType}:${channelId}`]) {
      logger.info(`Making new routers for channelId "${channelId}".`)
      network.routers[`${channelType}:${channelId}`] = []
      await Promise.all(
        network.workers.map(async (worker) => {
          const newRouter = await worker.createRouter({ mediaCodecs, appData: { worker } })
          network.routers[`${channelType}:${channelId}`].push(newRouter)
        })
      )
    }
  }
  spark.write({ type: MessageTypes.InitializeRouter.toString(), data: { initialized: true }, id: messageId })
}
