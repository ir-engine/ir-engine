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
  DataProducer,
  DataProducerOptions,
  Router,
  RtpCodecCapability,
  RtpParameters,
  Transport,
  WebRtcServer,
  Worker
} from 'mediasoup/node/lib/types'
import os from 'os'
import { Spark } from 'primus'

import { ChannelID } from '@etherealengine/common/src/dbmodels/Channel'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { MediaStreamAppData, NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { dispatchAction, getState } from '@etherealengine/hyperflux'
import config from '@etherealengine/server-core/src/appconfig'
import { localConfig, sctpParameters } from '@etherealengine/server-core/src/config'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'
import { ServerState } from '@etherealengine/server-core/src/ServerState'
import { WebRtcTransportParams } from '@etherealengine/server-core/src/types/WebRtcTransportParams'

import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import {
  DataChannelRegistryState,
  DataConsumerActions,
  DataProducerActions
} from '@etherealengine/engine/src/networking/systems/DataProducerConsumerState'
import {
  MediaConsumerActions,
  MediaProducerActions
} from '@etherealengine/engine/src/networking/systems/MediaProducerConsumerState'
import { NetworkTransportActions } from '@etherealengine/engine/src/networking/systems/NetworkTransportState'
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
  const cores = os.cpus()
  const routers = { instance: [] } as { instance: Router[]; [channelID: ChannelID]: Router[] }
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

export const handleConsumeData = async (action: typeof DataConsumerActions.requestConsumer.matches._TYPE) => {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { $peer: peerID, dataChannel } = action

  const peer = network.peers.get(peerID)!
  if (!peer) {
    logger.warn('No peer found for peerID: ' + peerID)
    return
  }

  const userId = getUserIdFromPeerID(network, peerID)!
  logger.info('Data Consumer being created on server by client: ' + userId)

  if (peer.outgoingDataConsumers!.has(dataChannel)) {
    return logger.info('Data consumer already exists for dataChannel: ' + dataChannel)
  }

  const newTransport = peer.recvTransport as Transport
  if (!newTransport) {
    return logger.warn('No recv transport found for peer: ' + peerID)
  }

  try {
    const outgoingDataProducer = network.outgoingDataProducers[dataChannel]
    const dataConsumer = await newTransport.consumeData({
      dataProducerId: outgoingDataProducer.id,
      appData: { peerID, transportId: newTransport.id }
    })

    dataConsumer.on('dataproducerclose', () => {
      dataConsumer.close()
      if (network.peers.has(peerID)) network.peers.get(peerID)!.outgoingDataConsumers!.delete(dataChannel)
    })

    const peer = network.peers.get(peerID)

    logger.info('Setting data consumer to network state.')
    if (!peer) {
      return logger.warn('No peer found for peerID: ' + peerID)
    }

    peer.outgoingDataConsumers!.set(dataChannel, dataConsumer)

    // Data consumers are all consuming the single producer that outputs from the server's message queue
    dispatchAction(
      DataConsumerActions.consumerCreated({
        consumerID: dataConsumer.id,
        peerID,
        producerID: outgoingDataProducer.id,
        dataChannel,
        sctpStreamParameters: dataConsumer.sctpStreamParameters as any,
        appData: dataConsumer.appData as any,
        protocol: dataConsumer.protocol,
        $to: peerID,
        $network: network.id,
        $topic: network.topic
      })
    )
  } catch (err) {
    logger.error(err, `Consume data error: ${err.message}.`)
    logger.info('Transport that could not be consumed: %o', newTransport)
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
  const dataProducers = Object.values(network.dataProducers)
  dataProducers.forEach((dataProducer) => closeDataProducer(network, dataProducer))
  const producers = Object.values(network.producers)
  producers.forEach((producer) => closeProducer(network, producer))
  if (transport && typeof transport.close === 'function') {
    await transport.close()
    delete network.mediasoupTransports[transport.id]
  }
}

export function closeProducer(network: SocketWebRTCServerNetwork, producer: ProducerExtension) {
  dispatchAction(
    MediaProducerActions.closeProducer({
      producerID: producer.id,
      $topic: network.topic,
      $network: network.id
    })
  )
}

export async function createWebRtcTransport(
  network: SocketWebRTCServerNetwork,
  { peerID, direction, sctpCapabilities, channelId }: WebRtcTransportParams
): Promise<WebRTCTransportExtension> {
  const { listenIps, initialAvailableOutgoingBitrate } = localConfig.mediasoup.webRtcTransport
  const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[]
  if (channelId) {
    if (!network.routers[channelId]) {
      network.routers[channelId] = [] as any
      await Promise.all(
        network.workers.map(async (worker) => {
          const newRouter = await worker.createRouter({ mediaCodecs, appData: { worker } })
          network.routers[channelId].push(newRouter)
          return Promise.resolve()
        })
      )
    }
    logger.info(`Worker created router for channel ${channelId}`)
  }
  const routerList: Router[] = channelId ? network.routers[channelId] : network.routers.instance

  const dumps = await Promise.all(routerList.map(async (item) => await item.dump()))
  const sortedDumps = dumps.sort((a, b) => a.transportIds.length - b.transportIds.length)
  const selectedrouter = routerList.find((item) => item.id === sortedDumps[0].id)!

  if (!selectedrouter) {
    logger.error('no router selected', routerList, dumps, sortedDumps)
    throw new Error('Failed to find a router to create a transport on')
  }

  return selectedrouter.createWebRtcTransport({
    webRtcServer: (selectedrouter.appData.worker as Worker).appData!.webRtcServer as WebRtcServer,
    enableUdp: true,
    enableTcp: false,
    preferUdp: true,
    enableSctp: true,
    numSctpStreams: sctpCapabilities.numStreams,
    initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
    appData: { peerID, channelId, clientDirection: direction } as MediaStreamAppData
  }) as any as Promise<WebRTCTransportExtension>
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
      const DataChannelFunctions = getState(DataChannelRegistryState)[dataProducer.label as DataChannelType]
      if (DataChannelFunctions) {
        for (const func of DataChannelFunctions) func(network, dataProducer.label as DataChannelType, peerID, message)
      }
    })
    return consumer
  } catch (err) {
    logger.error(err, 'Error creating internal data consumer. dataProducer: %o', dataProducer)
  }
  return null
}

export async function handleWebRtcTransportCreate(
  action: typeof NetworkTransportActions.requestTransport.matches._TYPE
): Promise<any> {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { $peer: peerID, direction, sctpCapabilities } = action

  try {
    const instance = getState(InstanceServerState).instance
    const channelId = instance.channelId!

    const existingTransports = Object.values(network.mediasoupTransports).filter(
      (t) => t.appData.peerID === peerID && t.appData.direction === direction && t.appData.channelId === channelId
    )
    await Promise.all(existingTransports.map((t) => closeTransport(network, t)))
    const newTransport = await createWebRtcTransport(network, {
      peerID: peerID,
      direction,
      sctpCapabilities: sctpCapabilities as any,
      channelId
    })

    if (!newTransport)
      return dispatchAction(
        NetworkTransportActions.requestTransportError({
          error: 'No transport was created',
          direction,
          $network: network.id,
          $topic: network.topic,
          $to: peerID
        })
      )

    await newTransport.setMaxIncomingBitrate(localConfig.mediasoup.webRtcTransport.maxIncomingBitrate)

    network.mediasoupTransports[newTransport.id] = newTransport

    // Distinguish between send and create transport of each client w.r.t producer and consumer (data or mediastream)
    if (direction === 'recv') {
      if (network.peers.has(peerID)) network.peers.get(peerID)!.recvTransport = newTransport
    } else if (direction === 'send') {
      if (network.peers.has(peerID)) network.peers.get(peerID)!.sendTransport = newTransport
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
    newTransport.observer.on('dtlsstatechange', (dtlsState) => {
      if (dtlsState === 'closed') closeTransport(network, newTransport as unknown as WebRTCTransportExtension)
    })

    dispatchAction(
      NetworkTransportActions.transportCreated({
        transportID: id,
        direction,
        sctpParameters: {
          ...sctpParameters,
          OS: (sctpCapabilities as any).numStreams.OS,
          MIS: (sctpCapabilities as any).numStreams.MIS
        },
        iceParameters,
        iceCandidates,
        dtlsParameters,
        $network: network.id,
        $topic: network.topic,
        $to: peerID
      })
    )
  } catch (err) {
    logger.error(err)

    return dispatchAction(
      NetworkTransportActions.requestTransportError({
        error: err,
        direction,
        $network: network.id,
        $topic: network.topic,
        $to: peerID
      })
    )
  }
}
/**
 * Handles the creation of a new producer
 * - Creates a new producer on the transport
 * - Adds the producer to the network.producers list
 * - Adds the producer to the network.peers[peerID].media list
 * - Sends the producer to all other peers in the network
 * - Sends the producer to the client that created it
 */
export async function handleProduceData(
  action: typeof DataProducerActions.requestProducer.matches._TYPE
): Promise<any> {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  console.log('handleProduceData', action)
  const {
    $peer: peerID,
    transportID: transportId,
    sctpStreamParameters,
    dataChannel: label,
    protocol,
    appData,
    requestID
  } = action

  try {
    const userId = getUserIdFromPeerID(network, peerID)
    if (!userId) {
      logger.info('userId could not be found for sparkID ' + peerID)
      return
    }

    if (typeof label !== 'string' || !getState(DataChannelRegistryState)[label]) {
      const errorMessage = 'Invalid data producer label (i.e. channel name) provided:' + label
      logger.error(errorMessage)
      return dispatchAction(
        DataProducerActions.requestProducerError({
          requestID,
          error: errorMessage,
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }

    if (!network.peers.has(peerID)) {
      const errorMessage = `Client no longer exists for userId "${userId}".`
      logger.error(errorMessage)
      return dispatchAction(
        DataProducerActions.requestProducerError({
          requestID,
          error: errorMessage,
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }

    logger.info(`peerID "${peerID}", Data channel "${label}" %o: `, action)
    const transport = network.mediasoupTransports[transportId]
    if (!transport) {
      logger.error('Invalid transport.')
      return dispatchAction(
        DataProducerActions.requestProducerError({
          requestID,
          error: 'Invalid transport',
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }

    const options: DataProducerOptions = {
      label: label ?? undefined,
      protocol: protocol ?? undefined,
      sctpStreamParameters,
      appData: { ...(appData || {}), peerID, transportId }
    }
    logger.info('Data producer params: %o', options)
    const dataProducer = await transport.produceData(options)
    network.dataProducers.set(dataProducer.id, dataProducer)

    logger.info(`User ${userId} producing data on ${label}`)
    if (!network.peers.has(peerID)) {
      logger.error('Client no longer exists.')
      return dispatchAction(
        DataProducerActions.requestProducerError({
          requestID,
          error: 'Client no longer exists',
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }

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
    if (!internalConsumer) {
      logger.error('Invalid data producer.')
      return dispatchAction(
        DataProducerActions.requestProducerError({
          requestID,
          error: 'Invalid data producer',
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }
    if (!network.peers.has(peerID)) {
      logger.error('Client no longer exists.')
      return dispatchAction(
        DataProducerActions.requestProducerError({
          requestID,
          error: 'Client no longer exists',
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }
    // network.peers.get(peerID)!.incomingDataConsumers!.set(label, internalConsumer)
    // Possibly do stuff with appData here
    logger.info('Sending dataproducer id to client: ' + dataProducer.id)
    return dispatchAction(
      DataProducerActions.producerCreated({
        requestID,
        transportID: transportId,
        producerID: dataProducer.id,
        dataChannel: label,
        protocol,
        sctpStreamParameters,
        appData,
        $network: action.$network,
        $topic: action.$topic,
        $to: peerID
      })
    )
  } catch (err) {
    logger.error(err)
    return dispatchAction(
      DataProducerActions.requestProducerError({
        requestID,
        error: err.message,
        $network: action.$network,
        $topic: action.$topic,
        $to: peerID
      })
    )
  }
}

export async function handleWebRtcTransportClose(action: typeof NetworkTransportActions.closeTransport.matches._TYPE) {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { transportID } = action
  const transport = network.mediasoupTransports[transportID]
  if (!transport) return

  await closeTransport(network, transport).catch((err) => logger.error(err, 'Error closing WebRTC transport.'))
}

export async function handleWebRtcTransportConnect(
  action: typeof NetworkTransportActions.requestTransportConnect.matches._TYPE
) {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { transportID, requestID, dtlsParameters } = action
  const transport = network.mediasoupTransports[transportID]
  if (transport) {
    const pending =
      network.transportsConnectPending[transportID] ?? transport.connect({ dtlsParameters: dtlsParameters as any })
    pending
      .then(() => {
        dispatchAction(
          NetworkTransportActions.transportConnected({
            transportID,
            requestID,
            $network: action.$network,
            $topic: action.$topic,
            $to: action.$peer
          })
        )
      })
      .catch((err) => {
        logger.error(err, 'handleWebRtcTransportConnect, data: %o', action)
        dispatchAction(
          NetworkTransportActions.requestTransportConnectError({
            requestID,
            error: err.message,
            $network: action.$network,
            $topic: action.$topic,
            $to: action.$peer
          })
        )
      })
    network.transportsConnectPending[transportID] = pending
  } else {
    logger.error('Invalid transport.')
    dispatchAction(
      NetworkTransportActions.requestTransportConnectError({
        requestID,
        error: 'Invalid transport',
        $network: action.$network,
        $topic: action.$topic,
        $to: action.$peer
      })
    )
  }
}

export async function handleRequestProducer(action: typeof MediaProducerActions.requestProducer.matches._TYPE) {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { $peer: peerID, transportID: transportId, rtpParameters, paused, requestID, appData, kind } = action
  const userId = getUserIdFromPeerID(network, peerID)

  const transport = network.mediasoupTransports[transportId]

  if (!transport) {
    logger.error('Invalid transport ID.')
    return dispatchAction(
      MediaProducerActions.requestProducerError({
        requestID,
        error: 'Invalid transport ID.',
        $network: action.$network,
        $topic: action.$topic,
        $to: peerID
      })
    )
  }

  try {
    const newProducerAppData = { ...appData, peerID, transportId } as MediaStreamAppData
    const existingProducer = await network.producers.find((producer) => producer.appData === newProducerAppData)
    if (existingProducer) throw new Error('Producer already exists for ' + peerID + ' ' + appData.mediaTag) //closeProducer(network, existingProducer)
    const producer = (await transport.produce({
      kind: kind as any,
      rtpParameters: rtpParameters as RtpParameters,
      paused,
      appData: newProducerAppData
    })) as unknown as ProducerExtension

    const routers = network.routers[appData.channelId]
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

    producer.on('transportclose', () => closeProducer(network, producer))

    network.producers.push(producer)
    logger.info(`New Producer: peerID "${peerID}", Media stream "${appData.mediaTag}"`)

    if (userId && network.peers.has(peerID)) {
      network.peers.get(peerID)!.media![appData.mediaTag!] = {
        paused,
        producerId: producer.id,
        globalMute: false,
        encodings: (rtpParameters as any).encodings,
        channelId: appData.channelId
      }
    }
    dispatchAction(
      MediaProducerActions.producerCreated({
        requestID,
        peerID,
        mediaTag: appData.mediaTag,
        producerID: producer.id,
        channelID: appData.channelId,
        $network: action.$network,
        $topic: action.$topic
      })
    )
  } catch (err) {
    logger.error(err, 'Error with sendTrack.')
    dispatchAction(
      MediaProducerActions.requestProducerError({
        requestID,
        error: 'Error with sendTrack: ' + err,
        $network: action.$network,
        $topic: action.$topic,
        $to: peerID
      })
    )
  }
}

export const handleRequestConsumer = async (action: typeof MediaConsumerActions.requestConsumer.matches._TYPE) => {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { peerID: mediaPeerId, mediaTag, rtpCapabilities, channelID } = action
  const peerID = action.$peer

  const producer = network.producers.find(
    (p) => p.appData.mediaTag === mediaTag && p.appData.peerID === mediaPeerId && p.appData.channelId === channelID
  )

  const transport = Object.values(network.mediasoupTransports).find(
    (t) =>
      t.appData.peerID === peerID &&
      t.appData.clientDirection === 'recv' &&
      t.appData.channelId === channelID &&
      !t.closed
  )!

  // @todo: the 'any' cast here is because WebRtcTransport.internal is protected - we should see if this is the proper accessor
  const router = network.routers[channelID].find((router) => router.id === transport?.internal.routerId)
  if (!producer || !router || !router.canConsume({ producerId: producer.id, rtpCapabilities })) {
    const msg = `Client cannot consume ${mediaPeerId}:${mediaTag}, ${producer?.id}`
    logger.error(`recv-track: ${peerID} ${msg}`)
    return
  }

  if (!transport) return
  try {
    const consumer = (await transport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: true, // see note above about always starting paused
      appData: { peerID, mediaPeerId, mediaTag, channelId: channelID }
    })) as unknown as ConsumerExtension

    // we need both 'transportclose' and 'producerclose' event handlers,
    // to make sure we close and clean up consumers in all circumstances
    consumer.on('transportclose', () => {
      logger.info(`Consumer's transport closed, consumer.id: "${consumer.id}".`)
      dispatchAction(
        MediaConsumerActions.closeConsumer({
          consumerID: consumer.id,
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    })
    consumer.on('producerclose', () => {
      logger.info(`Consumer's producer closed, consumer.id: "${consumer.id}".`)
      dispatchAction(
        MediaConsumerActions.closeConsumer({
          consumerID: consumer.id,
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
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

    dispatchAction(
      MediaConsumerActions.consumerCreated({
        channelID,
        consumerID: consumer.id,
        peerID: mediaPeerId,
        mediaTag,
        producerID: producer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        consumerType: consumer.type,
        paused: consumer.producerPaused,
        $network: action.$network,
        $topic: action.$topic,
        $to: peerID
      })
    )
  } catch (err) {
    logger.error(err, 'Error consuming transport %o.', transport)
  }
}

export async function handleConsumerSetLayers(
  action: typeof MediaConsumerActions.consumerLayers.matches._TYPE
): Promise<any> {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { consumerID, layer } = action
  const consumer = network.consumers.find((c) => c.id === consumerID)!
  if (!consumer) return logger.warn('consumer-set-layers: consumer not found ' + action.consumerID)
  logger.info('consumer-set-layers: %o, %o', layer, consumer.appData)
  try {
    await consumer.setPreferredLayers({ spatialLayer: layer })
  } catch (err) {
    logger.warn(err)
    logger.warn('consumer-set-layers: failed to set preferred layers ' + action.consumerID)
  }
}

export async function handleWebRtcInitializeRouter(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  peerID: PeerID,
  data,
  messageId: string
): Promise<any> {
  const { channelId } = data
  // @todo replace with if (isChannel)
  if (channelId) {
    const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[]
    if (!network.routers[channelId]) {
      logger.info(`Making new routers for channelId "${channelId}".`)
      network.routers[channelId] = []
      await Promise.all(
        network.workers.map(async (worker) => {
          const newRouter = await worker.createRouter({ mediaCodecs, appData: { worker } })
          network.routers[channelId].push(newRouter)
        })
      )
    }
  }
  spark.write({ type: MessageTypes.InitializeRouter.toString(), data: { initialized: true }, id: messageId })
}
