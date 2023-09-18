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
  WebRtcServer,
  Worker
} from 'mediasoup/node/lib/types'
import os from 'os'

import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { MediaStreamAppData, NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { dispatchAction, getMutableState, getState, none, State } from '@etherealengine/hyperflux'
import config from '@etherealengine/server-core/src/appconfig'
import { localConfig, sctpParameters } from '@etherealengine/server-core/src/config'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'
import { ServerState } from '@etherealengine/server-core/src/ServerState'
import { WebRtcTransportParams } from '@etherealengine/server-core/src/types/WebRtcTransportParams'

import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { DataChannelRegistryState } from '@etherealengine/engine/src/networking/systems/DataChannelRegistry'
import {
  MediasoupDataConsumerActions,
  MediasoupDataProducerActions,
  MediasoupDataProducerConsumerState,
  MediasoupDataProducersConsumersObjectsState
} from '@etherealengine/engine/src/networking/systems/MediasoupDataProducerConsumerState'
import {
  MediaProducerActions,
  MediasoupMediaConsumerActions,
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@etherealengine/engine/src/networking/systems/MediasoupMediaProducerConsumerState'
import {
  MediasoupTransportActions,
  MediasoupTransportObjectsState,
  MediasoupTransportState
} from '@etherealengine/engine/src/networking/systems/MediasoupTransportState'
import { decode } from 'msgpackr'
import { InstanceServerState } from './InstanceServerState'
import { MediasoupInternalWebRTCDataChannelState } from './MediasoupInternalWebRTCDataChannelState'
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
  const routers = [] as Router[]
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
    routers.push(newRouter)
    logger.info('Worker created router.')
    workers.push(newWorker)
  }

  return { routers, workers }
}

/**
 * Creates a new WebRTC transport for the given data channel.
 */
export const createOutgoingDataProducer = async (network: SocketWebRTCServerNetwork, dataChannel: DataChannelType) => {
  if (network.transport.outgoingDataProducers[dataChannel]) return

  logger.info('createOutgoingDataProducer %o', dataChannel)

  const transport = network.transport.outgoingDataTransport

  const outgoingDataProducer = await transport.produceData({
    label: dataChannel,
    protocol: 'raw',
    // sctpStreamParameters: {
    //   ordered: sctpStreamParameters.ordered
    // },
    appData: {
      peerID: 'outgoingProducer'
    }
  })

  const currentRouter = network.transport.routers[0]

  await Promise.all(
    network.transport.routers.map(async (router) => {
      if (router.id !== currentRouter.id)
        return currentRouter.pipeToRouter({ dataProducerId: outgoingDataProducer.id, router: router })
      else return Promise.resolve()
    })
  )
  const networkState = getMutableState(NetworkState).networks[network.id] as State<SocketWebRTCServerNetwork>
  networkState.transport.outgoingDataProducers[dataChannel].set(outgoingDataProducer)

  outgoingDataProducer.observer.on('close', () => {
    networkState.transport.outgoingDataProducers[dataChannel].set(none)
  })
}

export const handleConsumeData = async (action: typeof MediasoupDataConsumerActions.requestConsumer.matches._TYPE) => {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { $peer: peerID, dataChannel } = action

  const peer = network.peers[peerID]!
  if (!peer) {
    logger.warn('No peer found for peerID: ' + peerID)
    return
  }

  const userId = getUserIdFromPeerID(network, peerID)!
  logger.info('Data Consumer being created on server by client: ' + userId)

  const existingDataConsumer = getState(MediasoupInternalWebRTCDataChannelState)[peerID]?.outgoingDataConsumers?.[
    dataChannel
  ]

  if (existingDataConsumer) {
    return logger.info('Data consumer already exists for dataChannel: ' + dataChannel)
  }

  const newTransport = MediasoupTransportState.getTransport(network.id, 'recv', peerID) as WebRTCTransportExtension
  if (!newTransport) {
    return logger.warn('No recv transport found for peer: ' + peerID)
  }

  try {
    const outgoingDataProducer = network.transport.outgoingDataProducers[dataChannel]
    const dataConsumer = await newTransport.consumeData({
      dataProducerId: outgoingDataProducer.id,
      appData: { peerID, transportId: newTransport.id }
    })

    dataConsumer.on('dataproducerclose', () => {
      dataConsumer.close()
    })

    dataConsumer.on('transportclose', () => {
      dataConsumer.close()
    })

    if (!getState(MediasoupInternalWebRTCDataChannelState)[peerID]) {
      getMutableState(MediasoupInternalWebRTCDataChannelState)[peerID].set({
        outgoingDataConsumers: {},
        incomingDataConsumers: {}
      })
    }

    getMutableState(MediasoupInternalWebRTCDataChannelState)[peerID].outgoingDataConsumers[dataChannel].set(
      dataConsumer
    )

    dataConsumer.observer.on('close', () => {
      getMutableState(MediasoupInternalWebRTCDataChannelState)[peerID].outgoingDataConsumers[dataChannel].set(none)
    })

    const peer = network.peers[peerID]

    logger.info('Setting data consumer to network state.')
    if (!peer) {
      dataConsumer.close()
      return logger.warn('No peer found for peerID: ' + peerID)
    }

    // Data consumers are all consuming the single producer that outputs from the server's message queue
    dispatchAction(
      MediasoupDataConsumerActions.consumerCreated({
        consumerID: dataConsumer.id,
        peerID,
        transportID: newTransport.id,
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

export async function closeDataProducer(
  network: SocketWebRTCServerNetwork,
  dataProducerID: string,
  peerID: PeerID
): Promise<void> {
  const dataProducer = getState(MediasoupDataProducersConsumersObjectsState).producers[dataProducerID]
  if (!dataProducer) return logger.warn('Data producer not found for id: ' + dataProducerID)
  dispatchAction(
    MediasoupDataProducerActions.producerClosed({
      producerID: dataProducer.id,
      $topic: network.topic,
      $network: network.id
    })
  )
  dataProducer.close()
}

export function transportClosed(network: SocketWebRTCServerNetwork, transport: WebRTCTransportExtension) {
  logger.info(`Closing transport id "${transport.id}", appData: %o`, transport.appData)
  // our producer and consumer event handlers will take care of
  // calling producerClosed() and consumerClosed() on all the producers
  // and consumers associated with this transport
  if (getState(MediasoupDataProducerConsumerState)[network.id]) {
    const dataProducers = Object.values(getState(MediasoupDataProducerConsumerState)[network.id].producers)
    dataProducers.forEach((dataProducer) => {
      if (dataProducer.transportID === transport.id)
        dataProducer.producerID && closeDataProducer(network, dataProducer.producerID, dataProducer.appData.peerID)
    })
  }
  if (getState(MediasoupMediaProducerConsumerState)[network.id]) {
    const mediaProducers = Object.values(getState(MediasoupMediaProducerConsumerState)[network.id].producers)
    mediaProducers.forEach((producer) => {
      if (producer.transportID === transport.id) producerClosed(network, producer.producerID)
    })
  }

  getMutableState(MediasoupTransportObjectsState)[transport.id].set(none)

  try {
    transport.close()
  } catch (err) {
    logger.error(err, 'Error closing WebRTC transport.')
  }
}

export function producerClosed(network: SocketWebRTCServerNetwork, producerID: string) {
  dispatchAction(
    MediaProducerActions.producerClosed({
      producerID: producerID,
      $topic: network.topic,
      $network: network.id
    })
  )
}

export async function createWebRtcTransport(
  network: SocketWebRTCServerNetwork,
  { peerID, direction, sctpCapabilities, channelId }: WebRtcTransportParams
): Promise<WebRTCTransportExtension> {
  const { initialAvailableOutgoingBitrate } = localConfig.mediasoup.webRtcTransport
  const routerList = network.transport.routers

  logger.info('localConfig.mediasoup.webRtcTransport:', localConfig.mediasoup.webRtcTransport)
  logger.info('routerList:', routerList)

  const dumps = await Promise.all(routerList.map(async (item) => await item.dump()))
  const sortedDumps = dumps.sort((a, b) => a.transportIds.length - b.transportIds.length)
  const selectedrouter = routerList.find((item) => item.id === sortedDumps[0].id)!

  logger.info('dumps:', dumps)
  logger.info('sortedDumps:', sortedDumps)
  logger.info('selectedrouter:', selectedrouter)

  if (!selectedrouter) {
    logger.error('no router selected', routerList, dumps, sortedDumps)
    throw new Error('Failed to find a router to create a transport on')
  }

  logger.info('Creating WebRTC transport with parameters:')
  logger.info('peerID:', peerID)
  logger.info('direction:', direction)
  logger.info('sctpCapabilities:', sctpCapabilities)
  logger.info('channelId:', channelId)

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
    const transport = network.transport.outgoingDataTransport

    logger.info('Network transport:', transport)
    logger.info('DataProducer:', dataProducer)
    logger.info('PeerID:', peerID)

    const dataConsumer = await transport.consumeData({
      dataProducerId: dataProducer.id,
      appData: { peerID, transportId: transport.id },
      maxPacketLifeTime: dataProducer.sctpStreamParameters!.maxPacketLifeTime,
      maxRetransmits: dataProducer.sctpStreamParameters!.maxRetransmits,
      ordered: false
    })
    logger.info('DataConsumer:', dataConsumer)
    dataConsumer.on('message', (message) => {
      const [fromPeerIndex, data] = decode(message)
      // console.log({fromPeerIndex, data})
      const fromPeerID = network.peerIndexToPeerID[fromPeerIndex]
      // console.log(network.peerIDToPeerIndex, network.peerIndexToPeerID, fromPeerID)
      if (fromPeerID !== peerID) return //logger.warn('Received message from unexpected peerID: ' + fromPeerID + ' for ' + peerID)
      const DataChannelFunctions = getState(DataChannelRegistryState)[dataProducer.label as DataChannelType]
      if (DataChannelFunctions) {
        for (const func of DataChannelFunctions) func(network, dataProducer.label as DataChannelType, fromPeerID, data)
      }
    })

    if (!getState(MediasoupInternalWebRTCDataChannelState)[peerID]) {
      getMutableState(MediasoupInternalWebRTCDataChannelState)[peerID].set({
        outgoingDataConsumers: {},
        incomingDataConsumers: {}
      })
    }

    getMutableState(MediasoupInternalWebRTCDataChannelState)[peerID].incomingDataConsumers[dataProducer.label].set(
      dataConsumer
    )

    dataConsumer.observer.on('close', () => {
      getMutableState(MediasoupInternalWebRTCDataChannelState)[peerID].incomingDataConsumers[dataProducer.label].set(
        none
      )
    })

    dataConsumer.on('transportclose', () => {
      dataConsumer.close()
    })

    dataConsumer.on('dataproducerclose', () => {
      dataConsumer.close()
    })

    return dataConsumer
  } catch (err) {
    logger.error(err, 'Error creating internal data consumer. dataProducer: %o', dataProducer)
  }
  return null
}

export async function handleWebRtcTransportCreate(
  action: typeof MediasoupTransportActions.requestTransport.matches._TYPE
): Promise<any> {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { $peer: peerID, direction, sctpCapabilities } = action

  try {
    const instance = getState(InstanceServerState).instance
    const channelId = instance.channelId!

    const existingTransport = MediasoupTransportState.getTransport(
      network.id,
      direction,
      peerID
    ) as WebRTCTransportExtension
    if (existingTransport) transportClosed(network, existingTransport)

    const newTransport = await createWebRtcTransport(network, {
      peerID: peerID,
      direction,
      sctpCapabilities: sctpCapabilities as any,
      channelId
    })

    if (!newTransport)
      return dispatchAction(
        MediasoupTransportActions.requestTransportError({
          error: 'No transport was created',
          direction,
          $network: network.id,
          $topic: network.topic,
          $to: peerID
        })
      )

    await newTransport.setMaxIncomingBitrate(localConfig.mediasoup.webRtcTransport.maxIncomingBitrate)

    getMutableState(MediasoupTransportObjectsState)[newTransport.id].set(newTransport)

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
      const thisGs = (serverResult?.body as any).items.find(
        (server) => server.metadata.name === instanceServerState.instanceServer.objectMeta.name
      )

      for (const [index, candidate] of iceCandidates.entries()) {
        iceCandidates[index].port = thisGs.spec?.ports?.find(
          (portMapping) => portMapping.containerPort === candidate.port
        ).hostPort
      }
    }
    newTransport.observer.on('dtlsstatechange', (dtlsState) => {
      if (dtlsState === 'closed') transportClosed(network, newTransport as unknown as WebRTCTransportExtension)
    })

    dispatchAction(
      MediasoupTransportActions.transportCreated({
        peerID: action.peerID,
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
      MediasoupTransportActions.requestTransportError({
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
  action: typeof MediasoupDataProducerActions.requestProducer.matches._TYPE
): Promise<any> {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { $peer: peerID, transportID, sctpStreamParameters, dataChannel: label, protocol, appData, requestID } = action

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
        MediasoupDataProducerActions.requestProducerError({
          requestID,
          error: errorMessage,
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }

    if (!network.peers[peerID]) {
      const errorMessage = `Client no longer exists for userId "${userId}".`
      logger.error(errorMessage)
      return dispatchAction(
        MediasoupDataProducerActions.requestProducerError({
          requestID,
          error: errorMessage,
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }

    logger.info(`peerID "${peerID}", Data channel "${label}" %o: `, action)
    const transport = getState(MediasoupTransportObjectsState)[transportID]
    if (!transport) {
      logger.error('Invalid transport.')
      return dispatchAction(
        MediasoupDataProducerActions.requestProducerError({
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
      appData: { ...(appData || {}), peerID, transportId: transportID }
    }
    logger.info('Data producer params: %o', options)
    const dataProducer = await transport.produceData(options)

    logger.info(`User ${userId} producing data on ${label}`)
    if (!network.peers[peerID]) {
      logger.error('Client no longer exists.')
      return dispatchAction(
        MediasoupDataProducerActions.requestProducerError({
          requestID,
          error: 'Client no longer exists',
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }

    const currentRouter = network.transport.routers.find((router) => router.id === transport.internal.routerId)!

    await Promise.all(
      network.transport.routers.map(async (router) => {
        if (router.id !== transport.internal.routerId)
          return currentRouter.pipeToRouter({
            dataProducerId: dataProducer.id,
            router: router
          })
      })
    )

    // if our associated transport closes, close ourself, too
    dataProducer.on('transportclose', () => closeDataProducer(network, dataProducer.id, peerID))

    getMutableState(MediasoupDataProducersConsumersObjectsState).producers[dataProducer.id].set(dataProducer)

    dataProducer.observer.on('close', () => {
      getMutableState(MediasoupDataProducersConsumersObjectsState).producers[dataProducer.id].set(none)
    })

    const internalConsumer = await createInternalDataConsumer(network, dataProducer, peerID)
    if (!internalConsumer) {
      logger.error('Invalid data producer.')
      return dispatchAction(
        MediasoupDataProducerActions.requestProducerError({
          requestID,
          error: 'Invalid data producer',
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }
    if (!network.peers[peerID]) {
      logger.error('Client no longer exists.')
      return dispatchAction(
        MediasoupDataProducerActions.requestProducerError({
          requestID,
          error: 'Client no longer exists',
          $network: action.$network,
          $topic: action.$topic,
          $to: peerID
        })
      )
    }

    // Possibly do stuff with appData here
    logger.info('Sending dataproducer id to client: ' + dataProducer.id)
    return dispatchAction(
      MediasoupDataProducerActions.producerCreated({
        requestID,
        transportID: transportID,
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
      MediasoupDataProducerActions.requestProducerError({
        requestID,
        error: err.message,
        $network: action.$network,
        $topic: action.$topic,
        $to: peerID
      })
    )
  }
}

export async function handleWebRtcTransportClose(
  action: typeof MediasoupTransportActions.transportClosed.matches._TYPE
) {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { transportID } = action
  const transport = getState(MediasoupTransportObjectsState)[transportID]
  if (!transport) return

  transportClosed(network, transport)
}

const transportsConnectPending = {} as { [transportID: string]: Promise<void> }

export async function handleWebRtcTransportConnect(
  action: typeof MediasoupTransportActions.requestTransportConnect.matches._TYPE
) {
  const { transportID, requestID, dtlsParameters } = action
  const transport = getState(MediasoupTransportObjectsState)[transportID]
  if (transport) {
    const pending =
      transportsConnectPending[transportID] ?? transport.connect({ dtlsParameters: dtlsParameters as any })
    pending
      .then(() => {
        // delete transportsConnectPending[transportID]
        dispatchAction(
          MediasoupTransportActions.transportConnected({
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
        // delete transportsConnectPending[transportID]
        dispatchAction(
          MediasoupTransportActions.requestTransportConnectError({
            requestID,
            error: err.message,
            $network: action.$network,
            $topic: action.$topic,
            $to: action.$peer
          })
        )
      })
    transportsConnectPending[transportID] = pending
  } else {
    logger.error('Invalid transport.')
    dispatchAction(
      MediasoupTransportActions.requestTransportConnectError({
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

  const { $peer: peerID, transportID, rtpParameters, paused, requestID, appData, kind } = action
  const userId = getUserIdFromPeerID(network, peerID)

  const transport = getState(MediasoupTransportObjectsState)[transportID]

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
    const existingProducer = MediasoupMediaProducerConsumerState.getProducerByPeerIdAndMediaTag(
      network.id,
      peerID,
      appData.mediaTag
    ) as ProducerExtension
    if (existingProducer) throw new Error('Producer already exists for ' + peerID + ' ' + appData.mediaTag)
    const newProducerAppData = { ...appData, peerID, transportId: transportID } as MediaStreamAppData
    const producer = (await transport.produce({
      kind: kind as any,
      rtpParameters: rtpParameters as RtpParameters,
      paused,
      appData: newProducerAppData
    })) as unknown as ProducerExtension

    const routers = network.transport.routers
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

    producer.observer.on('close', () => {
      getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[producer.id].set(none)
    })

    producer.on('transportclose', () => producerClosed(network, producer.id))

    logger.info(`New Producer: peerID "${peerID}", Media stream "${appData.mediaTag}"`)

    if (userId && network.peers[peerID]) {
      network.peers[peerID]!.media![appData.mediaTag!] = {
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
        transportID,
        producerID: producer.id,
        channelID: appData.channelId,
        $network: action.$network,
        $topic: action.$topic
      })
    )

    // TODO: this must be done after producerCreated action is processed and the state exists - how can we improve this?
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

export const handleRequestConsumer = async (
  action: typeof MediasoupMediaConsumerActions.requestConsumer.matches._TYPE
) => {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCServerNetwork

  const { peerID: mediaPeerId, mediaTag, rtpCapabilities, channelID } = action
  const forPeerID = action.$peer

  const producer = Object.values(getState(MediasoupMediaProducerConsumerState)[network.id].producers).find(
    (p) => p.peerID === mediaPeerId && p.mediaTag === mediaTag
  )

  const transport = MediasoupTransportState.getTransport(network.id, 'recv', forPeerID) as WebRTCTransportExtension

  // @todo: the 'any' cast here is because WebRtcTransport.internal is protected - we should see if this is the proper accessor
  const router = network.transport.routers.find((router) => router.id === transport?.internal.routerId)
  if (!producer || !router || !transport || !router.canConsume({ producerId: producer.producerID, rtpCapabilities })) {
    logger.info('%o', { producer, router, transport })
    const msg = `Client cannot consume ${mediaPeerId}:${mediaTag}, ${producer?.producerID}`
    logger.error(`recv-track: ${forPeerID} ${msg}`)
    return
  }

  try {
    const consumer = (await transport.consume({
      producerId: producer.producerID,
      rtpCapabilities,
      paused: true, // see note above about always starting paused
      appData: { peerID: forPeerID, mediaPeerId, mediaTag, channelId: channelID }
    })) as unknown as ConsumerExtension

    getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers.merge({
      [consumer.id]: consumer
    })

    consumer.observer.on('close', () => {
      getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers[consumer.id].set(none)
    })

    // we need both 'transportclose' and 'producerclose' event handlers,
    // to make sure we close and clean up consumers in all circumstances
    consumer.on('transportclose', () => {
      logger.info(`Consumer's transport closed, consumer.id: "${consumer.id}".`)
      dispatchAction(
        MediasoupMediaConsumerActions.consumerClosed({
          consumerID: consumer.id,
          $network: action.$network,
          $topic: action.$topic,
          $to: forPeerID
        })
      )
    })
    consumer.on('producerclose', () => {
      logger.info(`Consumer's producer closed, consumer.id: "${consumer.id}".`)
      dispatchAction(
        MediasoupMediaConsumerActions.consumerClosed({
          consumerID: consumer.id,
          $network: action.$network,
          $topic: action.$topic,
          $to: forPeerID
        })
      )
    })

    dispatchAction(
      MediasoupMediaConsumerActions.consumerCreated({
        channelID,
        consumerID: consumer.id,
        peerID: mediaPeerId,
        transportID: transport.id,
        mediaTag,
        producerID: producer.producerID,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        consumerType: consumer.type,
        paused: consumer.producerPaused,
        $network: action.$network,
        $topic: action.$topic,
        $to: forPeerID
      })
    )
  } catch (err) {
    logger.error(err, 'Error consuming transport %o.', transport)
  }
}

export async function handleConsumerSetLayers(
  action: typeof MediasoupMediaConsumerActions.consumerLayers.matches._TYPE
): Promise<any> {
  const { consumerID, layer } = action
  const consumer = getState(MediasoupMediaProducersConsumersObjectsState).consumers[consumerID] as
    | ConsumerExtension
    | undefined
  if (!consumer) return logger.warn('consumer-set-layers: consumer not found ' + action.consumerID)
  logger.info('consumer-set-layers: %o, %o', layer, consumer.appData)
  try {
    await consumer.setPreferredLayers({ spatialLayer: layer })
  } catch (err) {
    logger.warn(err)
    logger.warn('consumer-set-layers: failed to set preferred layers ' + action.consumerID)
  }
}
