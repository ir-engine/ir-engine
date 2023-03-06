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
  Transport,
  WebRtcTransport
} from 'mediasoup/node/lib/types'
import os from 'os'
import { Spark } from 'primus'

import { MediaStreamAppData, MediaTagType } from '@etherealengine/common/src/interfaces/MediaStreamConstants'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import config from '@etherealengine/server-core/src/appconfig'
import { localConfig, sctpParameters } from '@etherealengine/server-core/src/config'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'
import { WebRtcTransportParams } from '@etherealengine/server-core/src/types/WebRtcTransportParams'

import { getUserIdFromPeerID } from './NetworkFunctions'
import {
  ConsumerExtension,
  ProducerExtension,
  SocketWebRTCServerNetwork,
  WebRTCTransportExtension
} from './SocketWebRTCServerNetwork'

const logger = multiLogger.child({ component: 'instanceserver:webrtc' })

const toArrayBuffer = (buf): any => {
  var ab = new ArrayBuffer(buf.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

export async function startWebRTC(network: SocketWebRTCServerNetwork): Promise<void> {
  logger.info('Starting WebRTC Server.')
  // Initialize roomstate
  const cores = os.cpus()
  network.routers = { instance: [] }
  for (let i = 0; i < cores.length; i++) {
    const newWorker = await createWorker({
      logLevel: 'debug',
      rtcMinPort: localConfig.mediasoup.worker.rtcMinPort,
      rtcMaxPort: localConfig.mediasoup.worker.rtcMaxPort,
      // dtlsCertificateFile: serverConfig.server.certPath,
      // dtlsPrivateKeyFile: serverConfig.server.keyPath,
      logTags: ['sctp']
    })

    newWorker.on('died', (err) => {
      logger.fatal(err, 'mediasoup worker died (this should never happen)')
      process.exit(1)
    })

    logger.info('Created Mediasoup worker.')

    const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[]
    const newRouter = await newWorker.createRouter({ mediaCodecs })
    network.routers.instance.push(newRouter)
    logger.info('Worker created router.')
    network.workers.push(newWorker)
  }
}

export const sendNewProducer =
  (network: SocketWebRTCServerNetwork, spark: Spark, channelType: string, channelId?: string) =>
  async (producer: ProducerExtension): Promise<void> => {
    const peerID = spark.id as PeerID
    const userId = getUserIdFromPeerID(network, spark.id)!
    const selfClient = network.peers.get(peerID)!
    if (selfClient?.peerID != null) {
      for (const [, client] of network.peers) {
        logger.info(`Sending media for "${userId}".`)
        client?.media &&
          Object.entries(client.media!).map(([subName, subValue]) => {
            if (
              channelType === 'instance'
                ? 'instance' === (subValue as any).channelType
                : (subValue as any).channelType === channelType && (subValue as any).channelId === channelId
            )
              selfClient.spark!.write({
                type: MessageTypes.WebRTCCreateProducer.toString(),
                data: {
                  peerID,
                  mediaTag: subName,
                  producerId: producer.id,
                  channelType,
                  channelId
                }
              })
          })
      }
    }
  }
// Create consumer for each client!
export const sendCurrentProducers = async (
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  userIds: string[],
  channelType: string,
  channelId?: string
): Promise<void> => {
  const peerID = spark.id as PeerID
  const selfUserId = getUserIdFromPeerID(network, spark.id)!
  const selfClient = network.peers.get(peerID)!
  if (selfClient?.peerID) {
    for (const [peerID, client] of network.peers) {
      if (
        !(
          client.userId === selfUserId ||
          (userIds.length > 0 && !userIds.includes(client.userId)) ||
          !client.media ||
          !client.peerID
        )
      )
        Object.entries(client.media).map(([subName, subValue]) => {
          if (
            (subValue as any).channelType === channelType &&
            (subValue as any).channelId === channelId &&
            !(subValue as any).paused
          )
            selfClient.spark!.write({
              type: MessageTypes.WebRTCCreateProducer.toString(),
              data: {
                peerID,
                mediaTag: subName,
                producerId: (subValue as any).producerId,
                channelType,
                channelId
              }
            })
        })
    }
  }
}

export const handleConsumeDataEvent =
  (network: SocketWebRTCServerNetwork, spark: Spark) =>
  async (dataProducer: DataProducer): Promise<any> => {
    const peerID = spark.id as PeerID
    const userId = getUserIdFromPeerID(network, spark.id)!
    logger.info('Data Consumer being created on server by client: ' + userId)
    if (!network.peers.has(peerID)) {
      return false
    }

    const newTransport: Transport = network.peers.get(peerID)!.instanceRecvTransport
    const outgoingDataProducer = network.outgoingDataProducer

    if (newTransport) {
      try {
        const dataConsumer = await newTransport.consumeData({
          dataProducerId: outgoingDataProducer.id,
          appData: { peerID, transportId: newTransport.id }
        })

        dataConsumer.on('dataproducerclose', () => {
          dataConsumer.close()
          if (network.peers.has(peerID)) network.peers.get(peerID)!.dataConsumers!.delete(dataProducer.id)
        })

        logger.info('Setting data consumer to room state.')
        if (!network.peers.has(peerID)) {
          return spark.write({
            type: MessageTypes.WebRTCConsumeData.toString(),
            data: { error: 'client no longer exists' }
          })
        }

        network.peers.get(peerID)!.dataConsumers!.set(dataProducer.id, dataConsumer)

        const dataProducerOut = network.peers.get(peerID)!.dataProducers!.get('instance')

        // Data consumers are all consuming the single producer that outputs from the server's message queue
        spark.write({
          type: MessageTypes.WebRTCConsumeData.toString(),
          data: {
            dataProducerId: dataProducerOut.id,
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
        spark.write({ type: MessageTypes.WebRTCConsumeData.toString(), data: { error: 'transport did not exist' } })
      }
    } else {
      spark.write({ type: MessageTypes.WebRTCConsumeData.toString(), data: { error: 'transport did not exist' } })
    }
  }

export async function closeTransport(
  network: SocketWebRTCServerNetwork,
  transport: WebRTCTransportExtension
): Promise<void> {
  logger.info(`Closing transport id "${transport.id}", appData: %o`, transport.appData)
  // our producer and consumer event handlers will take care of
  // calling closeProducer() and closeConsumer() on all the producers
  // and consumers associated with this transport
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
          const newRouter = await worker.createRouter({ mediaCodecs })
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
    listenIps: listenIps,
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
      network.incomingMessageQueueUnreliable.add(toArrayBuffer(message))
      network.incomingMessageQueueUnreliableIDs.add(peerID)
      // forward data to clients in world immediately
      // TODO: need to include the userId (or index), so consumers can validate
      network.sendData(message)
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
  data: WebRtcTransportParams,
  messageId: string
): Promise<any> {
  try {
    const peerID = spark.id as PeerID
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
      const serverResult = await network.app.k8AgonesClient.listNamespacedCustomObject(
        'agones.dev',
        'v1',
        'default',
        'gameservers'
      )
      const thisGs = (serverResult?.body! as any).items.find(
        (server) => server.metadata.name === network.app.instanceServer.objectMeta.name
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
    // Create data consumers for other clients if the current client transport receives data producer on it
    newTransport.observer.on('newdataproducer', handleConsumeDataEvent(network, spark))
    newTransport.observer.on('newproducer', sendNewProducer(network, spark, channelType, channelId) as any)
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
  data,
  messageId: string
): Promise<any> {
  try {
    console.log('webRTCProduceData')
    const peerID = spark.id as PeerID
    const userId = getUserIdFromPeerID(network, spark.id)
    if (!userId) {
      logger.info('userId could not be found for sparkID ' + spark.id)
      return
    }
    if (!data.label) {
      const errorMessage = 'No data producer label (i.e. channel name) provided.'
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
    const { transportId, sctpStreamParameters, label, protocol, appData } = data
    logger.info(`Data channel label: "${label}", userId "${userId}".`)
    logger.info('Data producer params: %o', data)
    const transport = network.mediasoupTransports[transportId]
    const options: DataProducerOptions = {
      label,
      protocol,
      sctpStreamParameters,
      appData: { ...(appData || {}), peerID, transportId }
    }
    logger.info('Data producer params: %o', options)
    if (transport) {
      try {
        const dataProducer = await transport.produceData(options)
        console.log('new dataProducer', dataProducer)
        network.dataProducers.set(label, dataProducer)
        logger.info(`User ${userId} producing data.`)
        if (network.peers.has(peerID)) {
          network.peers.get(peerID)!.dataProducers!.set(label, dataProducer)

          const currentRouter = network.routers.instance.find(
            (router) => router.id === (transport as any)?.internal.routerId
          )!

          await Promise.all(
            network.routers.instance.map(async (router) => {
              if (router.id !== (transport as any)?.internal.routerId) {
                return currentRouter.pipeToRouter({
                  dataProducerId: dataProducer.id,
                  router: router
                })
              }
            })
          )

          // if our associated transport closes, close ourself, too
          dataProducer.on('transportclose', () => {
            network.dataProducers.delete(label)
            logger.info("data producer's transport closed: " + dataProducer.id)
            dataProducer.close()
            network.peers.get(peerID)!.dataProducers!.delete(label)
          })
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
            network.peers.get(peerID)!.dataConsumers!.set(label, internalConsumer)
            // transport.handleConsumeDataEvent(socket);
            logger.info('transport.handleConsumeDataEvent(spark)')
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

export async function handleWebRtcCloseProducer(network: SocketWebRTCServerNetwork, spark: Spark, data, messageId) {
  const { producerId } = data
  const producer = network.producers.find((p) => p.id === producerId)!
  try {
    const hostClient = Array.from(network.peers.entries()).find(([, client]) => {
      return client.media && client.media![producer.appData.mediaTag]?.producerId === producerId
    })!
    if (hostClient && hostClient[1])
      hostClient[1].spark!.write({ type: MessageTypes.WebRTCCloseProducer.toString(), data: producerId, id: messageId })
    await closeProducerAndAllPipeProducers(network, producer)
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
  data: HandleWebRtcSendTrackData,
  messageId: string
) {
  const peerID = spark.id as PeerID
  const userId = getUserIdFromPeerID(network, spark.id)
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
    } as any)) as unknown as ProducerExtension

    const routers = network.routers[`${appData.channelType}:${appData.channelId}`]
    const currentRouter = routers.find((router) => router.id === (transport as any)?.internal.routerId)!

    await Promise.all(
      routers.map(async (router: Router) => {
        if ((router as any).id !== (transport as any)?.internal.routerId) {
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

    if (userId && network.peers.has(peerID)) {
      network.peers.get(peerID)!.media![appData.mediaTag] = {
        paused,
        producerId: producer.id,
        globalMute: false,
        encodings: rtpParameters.encodings,
        channelType: appData.channelType,
        channelId: appData.channelId
      }
    }

    for (const [clientPeerID, client] of network.peers) {
      if (clientPeerID !== peerID && client.spark) {
        client.spark!.write({
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
  data: HandleWebRtcReceiveTrackData,
  messageId: string
): Promise<any> {
  const peerID = spark.id as PeerID
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
    const msg = `Client cannot consume ${mediaPeerId}:${mediaTag}, ${producer}`
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
  data,
  messageId: string
): Promise<any> {
  const { consumerId } = data
  const consumer = network.consumers.find((c) => c.id === consumerId)
  if (consumer) {
    if (typeof consumer.resume === 'function' && !consumer.closed && !(consumer as any)._closed) await consumer.resume()
    spark.write({ type: MessageTypes.WebRTCResumeConsumer.toString(), data: consumer.id })
  }
  spark.write({ type: MessageTypes.WebRTCResumeConsumer.toString(), data: { resumed: true }, id: messageId })
}

export async function handleWebRtcCloseConsumer(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  data,
  messageId: string
): Promise<any> {
  const { consumerId } = data
  const consumer = network.consumers.find((c) => c.id === consumerId)
  if (consumer) {
    await closeConsumer(network, consumer)
  }
  spark.write({ type: MessageTypes.WebRTCCloseConsumer.toString(), data: { closed: true }, id: messageId })
}

export async function handleWebRtcConsumerSetLayers(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  data,
  messageId: string
): Promise<any> {
  const { consumerId, spatialLayer } = data
  const consumer = network.consumers.find((c) => c.id === consumerId)!
  logger.info('consumer-set-layers: %o, %o', spatialLayer, consumer.appData)
  await consumer.setPreferredLayers({ spatialLayer })
  spark.write({ type: MessageTypes.WebRTCConsumerSetLayers.toString(), data: { layersSet: true }, id: messageId })
}

export async function handleWebRtcResumeProducer(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  data,
  messageId: string
): Promise<any> {
  const peerID = spark.id as PeerID
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
  spark.write({ type: MessageTypes.WebRTCResumeProducer.toString(), data: { resumed: true }, id: messageId })
}

export async function handleWebRtcPauseProducer(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
  data,
  messageId: string
): Promise<any> {
  const peerID = spark.id as PeerID
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
  data,
  messageId: string
): Promise<any> {
  const { userIds, channelType, channelId } = data
  await sendCurrentProducers(network, spark, userIds || [], channelType, channelId)
  spark.write({ type: MessageTypes.WebRTCRequestCurrentProducers.toString(), data: { requested: true }, id: messageId })
}

export async function handleWebRtcInitializeRouter(
  network: SocketWebRTCServerNetwork,
  spark: Spark,
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
          const newRouter = await worker.createRouter({ mediaCodecs })
          network.routers[`${channelType}:${channelId}`].push(newRouter)
        })
      )
    }
  }
  spark.write({ type: MessageTypes.InitializeRouter.toString(), data: { initialized: true }, id: messageId })
}
