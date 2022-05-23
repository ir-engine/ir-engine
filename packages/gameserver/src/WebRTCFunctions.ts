import { createWorker } from 'mediasoup'
import {
  DataConsumer,
  DataConsumerOptions,
  DataProducer,
  DataProducerOptions,
  Producer,
  Router,
  RtpCodecCapability,
  Transport,
  WebRtcTransport
} from 'mediasoup/node/lib/types'
import os from 'os'
import SocketIO from 'socket.io'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { getNearbyUsers } from '@xrengine/engine/src/networking/functions/getNearbyUsers'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import config from '@xrengine/server-core/src/appconfig'
import { localConfig, sctpParameters } from '@xrengine/server-core/src/config'
import multiLogger from '@xrengine/server-core/src/logger'
import { WebRtcTransportParams } from '@xrengine/server-core/src/types/WebRtcTransportParams'

import { getUserIdFromSocketId } from './NetworkFunctions'
import { SocketWebRTCServerTransport } from './SocketWebRTCServerTransport'

const logger = multiLogger.child({ component: 'gameserver:webrtc' })

const toArrayBuffer = (buf): any => {
  var ab = new ArrayBuffer(buf.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

export async function startWebRTC(networkTransport: SocketWebRTCServerTransport): Promise<void> {
  logger.info('Starting WebRTC Server.')
  // Initialize room state
  const cores = os.cpus()
  networkTransport.routers = { instance: [] }
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
    networkTransport.routers.instance.push(newRouter)
    logger.info('Worker created router.')
    networkTransport.workers.push(newWorker)
  }
}

export const sendNewProducer =
  (networkTransport: SocketWebRTCServerTransport, socket: SocketIO.Socket, channelType: string, channelId?: string) =>
  async (producer: Producer): Promise<void> => {
    const userId = getUserIdFromSocketId(socket.id)!
    const world = Engine.instance.currentWorld
    const selfClient = world.clients.get(userId)!
    if (selfClient?.socketId != null) {
      for (const [, client] of world.clients) {
        logger.info(`Sending media for "${userId}".`)
        client?.media &&
          Object.entries(client.media!).map(([subName, subValue]) => {
            if (
              channelType === 'instance'
                ? 'instance' === (subValue as any).channelType
                : (subValue as any).channelType === channelType && (subValue as any).channelId === channelId
            )
              selfClient.socket!.emit(
                MessageTypes.WebRTCCreateProducer.toString(),
                client.userId,
                subName,
                producer.id,
                channelType,
                channelId
              )
          })
      }
    }
  }
// Create consumer for each client!
export const sendCurrentProducers = async (
  socket: SocketIO.Socket,
  userIds: string[],
  channelType: string,
  channelId?: string
): Promise<void> => {
  const world = Engine.instance.currentWorld
  const selfUserId = getUserIdFromSocketId(socket.id)!
  const selfClient = world.clients.get(selfUserId)!
  if (selfClient?.socketId) {
    for (const [userId, client] of world.clients) {
      if (
        !(
          userId === selfUserId ||
          (userIds.length > 0 && !userIds.includes(userId)) ||
          !client.media ||
          !client.socketId
        )
      )
        Object.entries(client.media).map(([subName, subValue]) => {
          if (
            (subValue as any).channelType === channelType &&
            (subValue as any).channelId === channelId &&
            !(subValue as any).paused
          )
            selfClient.socket!.emit(
              MessageTypes.WebRTCCreateProducer.toString(),
              client.userId,
              subName,
              (subValue as any).producerId,
              channelType,
              channelId
            )
        })
    }
  }
}

export const handleConsumeDataEvent =
  (networkTransport: SocketWebRTCServerTransport, socket: SocketIO.Socket) =>
  async (dataProducer: DataProducer): Promise<any> => {
    const userId = getUserIdFromSocketId(socket.id)!
    logger.info('Data Consumer being created on server by client: ' + userId)
    const world = Engine.instance.currentWorld
    if (!world.clients.has(userId)) {
      return false
    }

    const newTransport: Transport = world.clients.get(userId)!.instanceRecvTransport
    const outgoingDataProducer = networkTransport.outgoingDataProducer

    if (newTransport) {
      try {
        const dataConsumer = await newTransport.consumeData({
          dataProducerId: outgoingDataProducer.id,
          appData: { peerId: userId, transportId: newTransport.id }
        })

        dataConsumer.on('producerclose', () => {
          dataConsumer.close()
          if (world.clients.has(userId)) world.clients.get(userId)!.dataConsumers!.delete(dataProducer.id)
        })

        logger.info('Setting data consumer to room state.')
        if (!world.clients.has(userId)) {
          return socket.emit(MessageTypes.WebRTCConsumeData.toString(), { error: 'client no longer exists' })
        }

        world.clients.get(userId)!.dataConsumers!.set(dataProducer.id, dataConsumer)

        const dataProducerOut = world.clients.get(userId)!.dataProducers!.get('instance')

        // Data consumers are all consuming the single producer that outputs from the server's message queue
        socket.emit(MessageTypes.WebRTCConsumeData.toString(), {
          dataProducerId: dataProducerOut.id,
          sctpStreamParameters: dataConsumer.sctpStreamParameters,
          label: dataConsumer.label,
          id: dataConsumer.id,
          appData: dataConsumer.appData,
          protocol: 'raw'
        } as DataConsumerOptions)
      } catch (err) {
        logger.error(err, `Consume data error: ${err.message}.`)
        logger.info('Transport that could not be consumed: %o', newTransport)
        socket.emit(MessageTypes.WebRTCConsumeData.toString(), { error: 'transport did not exist' })
      }
    } else {
      socket.emit(MessageTypes.WebRTCConsumeData.toString(), { error: 'transport did not exist' })
    }
  }

export async function closeTransport(
  networkTransport: SocketWebRTCServerTransport,
  transport: WebRtcTransport
): Promise<void> {
  logger.info(`Closing transport id "${transport.id}", appData: %o`, transport.appData)
  // our producer and consumer event handlers will take care of
  // calling closeProducer() and closeConsumer() on all the producers
  // and consumers associated with this transport
  if (transport && typeof transport.close === 'function') {
    await transport.close()
    delete networkTransport.mediasoupTransports[transport.id]
  }
}

export async function closeProducer(producer): Promise<void> {
  logger.info(`Closing producer id "${producer.id}", appData: %o`, producer.appData)
  await producer.close()

  if (MediaStreams.instance) {
    MediaStreams.instance.producers = MediaStreams.instance?.producers.filter((p) => p.id !== producer.id)
  }

  const world = Engine.instance.currentWorld
  if (world.clients.has(producer.appData.peerId)) {
    delete world.clients.get(producer.appData.peerId)!.media![producer.appData.mediaTag]
  }
}

export async function closeProducerAndAllPipeProducers(producer): Promise<void> {
  logger.info(`Closing producer id "${producer?.id}" and all pipe producers, appData: %o`, producer?.appData)
  if (producer != null) {
    // remove this producer from our roomState.producers list
    if (MediaStreams.instance) {
      MediaStreams.instance.producers = MediaStreams.instance?.producers.filter((p) => p.id !== producer.id)
    }

    // finally, close the original producer
    await producer.close()

    // remove this producer from our roomState.producers list
    if (MediaStreams.instance) {
      MediaStreams.instance.producers = MediaStreams.instance?.producers.filter((p) => p.id !== producer.id)
      MediaStreams.instance.consumers = MediaStreams.instance?.consumers.filter(
        (c) => !(c.appData.mediaTag === producer.appData.mediaTag && c.producerId === producer.id)
      )
    }

    // remove this track's info from our roomState...mediaTag bookkeeping
    delete Engine.instance.currentWorld.clients.get(producer.appData.peerId)?.media![producer.appData.mediaTag]
  }
}

export async function closeConsumer(consumer): Promise<void> {
  await consumer.close()

  if (MediaStreams.instance) {
    MediaStreams.instance.consumers = MediaStreams.instance?.consumers.filter((c) => c.id !== consumer.id)
  }

  const world = Engine.instance.currentWorld
  for (const [, client] of world.clients) {
    if (client.socket) {
      client.socket!.emit(MessageTypes.WebRTCCloseConsumer.toString(), consumer.id)
    }
  }

  delete world.clients.get(consumer.appData.peerId)?.consumerLayers![consumer.id]
}

export async function createWebRtcTransport(
  networkTransport: SocketWebRTCServerTransport,
  { peerId, direction, sctpCapabilities, channelType, channelId }: WebRtcTransportParams
): Promise<WebRtcTransport> {
  const { listenIps, initialAvailableOutgoingBitrate } = localConfig.mediasoup.webRtcTransport
  const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[]
  if (channelType !== 'instance') {
    if (!networkTransport.routers[`${channelType}:${channelId}`]) {
      networkTransport.routers[`${channelType}:${channelId}`] = [] as any
      await Promise.all(
        networkTransport.workers.map(async (worker) => {
          const newRouter = await worker.createRouter({ mediaCodecs })
          networkTransport.routers[`${channelType}:${channelId}`].push(newRouter)
          return Promise.resolve()
        })
      )
    }
    logger.info(`Worker created router for channel ${channelType}:${channelId}`)
  }

  const routerList =
    channelType === 'instance' && !channelId
      ? networkTransport.routers.instance
      : networkTransport.routers[`${channelType}:${channelId}`]

  const dumps: any = await Promise.all(routerList.map(async (item) => await item.dump()))
  const sortedDumps = dumps.sort((a, b) => a.transportIds.length - b.transportIds.length)
  const selectedrouter = routerList.find((item) => item.id === sortedDumps[0].id)!

  const newTransport = await selectedrouter?.createWebRtcTransport({
    listenIps: listenIps,
    enableUdp: true,
    enableTcp: false,
    preferUdp: true,
    enableSctp: true,
    numSctpStreams: sctpCapabilities.numStreams,
    initialAvailableOutgoingBitrate: initialAvailableOutgoingBitrate,
    appData: { peerId, channelType, channelId, clientDirection: direction }
  })

  // logger.info('New transport to return:')
  // logger.info(newTransport)
  return newTransport
}

export async function createInternalDataConsumer(
  networkTransport: SocketWebRTCServerTransport,
  dataProducer: DataProducer,
  userId: string
): Promise<DataConsumer | null> {
  try {
    const consumer = await networkTransport.outgoingDataTransport.consumeData({
      dataProducerId: dataProducer.id,
      appData: { peerId: userId, transportId: networkTransport.outgoingDataTransport.id },
      maxPacketLifeTime: dataProducer.sctpStreamParameters!.maxPacketLifeTime,
      maxRetransmits: dataProducer.sctpStreamParameters!.maxRetransmits,
      ordered: false
    })
    consumer.on('message', (message) => {
      networkTransport.incomingMessageQueueUnreliable.add(toArrayBuffer(message))
      networkTransport.incomingMessageQueueUnreliableIDs.add(userId)
      // forward data to clients in world immediately
      // TODO: need to include the userId (or index), so consumers can validate
      networkTransport.sendData(message)
    })
    return consumer
  } catch (err) {
    logger.error(err, 'Error creating internal data consumer. dataProducer: %o', dataProducer)
  }
  return null
}

export async function handleWebRtcTransportCreate(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data: WebRtcTransportParams,
  callback
): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)!
  const { direction, peerId, sctpCapabilities, channelType, channelId } = Object.assign(data, { peerId: userId })

  const existingTransports = networkTransport.mediasoupTransports.filter(
    (t) =>
      t.appData.peerId === peerId &&
      t.appData.direction === direction &&
      (channelType === 'instance'
        ? t.appData.channelType === 'instance'
        : t.appData.channelType === channelType && t.appData.channelId === channelId)
  )
  await Promise.all(existingTransports.map((t) => closeTransport(networkTransport, t)))
  const newTransport: WebRtcTransport = await createWebRtcTransport(networkTransport, {
    peerId,
    direction,
    sctpCapabilities,
    channelType,
    channelId
  })

  await newTransport.setMaxIncomingBitrate(localConfig.mediasoup.webRtcTransport.maxIncomingBitrate)

  networkTransport.mediasoupTransports[newTransport.id] = newTransport

  // Distinguish between send and create transport of each client w.r.t producer and consumer (data or mediastream)
  const world = Engine.instance.currentWorld
  if (direction === 'recv') {
    if (channelType === 'instance' && world.clients.has(userId)) {
      world.clients.get(userId)!.instanceRecvTransport = newTransport
    } else if (channelType !== 'instance' && channelId) {
      world.clients.get(userId)!.channelRecvTransport = newTransport
    }
  } else if (direction === 'send') {
    if (channelType === 'instance' && world.clients.has(userId)) {
      world.clients.get(userId)!.instanceSendTransport = newTransport
    } else if (channelType !== 'instance' && channelId && world.clients.has(userId)) {
      world.clients.get(userId)!.channelSendTransport = newTransport
    }
  }

  const { id, iceParameters, iceCandidates, dtlsParameters } = newTransport

  if (config.kubernetes.enabled) {
    const serverResult = await networkTransport.app.k8AgonesClient.listNamespacedCustomObject(
      'agones.dev',
      'v1',
      'default',
      'gameservers'
    )
    const thisGs = (serverResult?.body! as any).items.find(
      (server) => server.metadata.name === networkTransport.app.gameServer.objectMeta.name
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
    if (dtlsState === 'closed') closeTransport(networkTransport, newTransport)
  })
  // Create data consumers for other clients if the current client transport receives data producer on it
  newTransport.observer.on('newdataproducer', handleConsumeDataEvent(networkTransport, socket))
  newTransport.observer.on('newproducer', sendNewProducer(networkTransport, socket, channelType, channelId))
  // logger.log('Callback from transportCreate with options:');
  // logger.log(clientTransportOptions);
  callback({ transportOptions: clientTransportOptions })
}

export async function handleWebRtcProduceData(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)
  if (!userId) {
    logger.info('userId could not be found for socketId ' + socket.id)
    return
  }
  if (!data.label) {
    const errorMessage = 'No data producer label (i.e. channel name) provided.'
    logger.error(errorMessage)
    return callback({ error: errorMessage })
  }

  const world = Engine.instance.currentWorld
  if (!world.clients.has(userId)) {
    const errorMessage = `Client no longer exists for userId "${userId}".`
    logger.error(errorMessage)
    return callback({ error: errorMessage })
  }
  const { transportId, sctpStreamParameters, label, protocol, appData } = data
  logger.info(`Data channel label: "${label}", userId "${userId}".`)
  logger.info('Data producer params: %o', data)
  const transport: any = networkTransport.mediasoupTransports[transportId]
  const options: DataProducerOptions = {
    label,
    protocol,
    sctpStreamParameters,
    appData: { ...(appData || {}), peerID: userId, transportId }
  }
  logger.info('Data producer params: %o', options)
  if (transport) {
    try {
      const dataProducer = await transport.produceData(options)
      networkTransport.dataProducers.set(label, dataProducer)
      logger.info(`User ${userId} producing data.`)
      if (world.clients.has(userId)) {
        world.clients.get(userId)!.dataProducers!.set(label, dataProducer)

        const currentRouter = networkTransport.routers.instance.find(
          (router) => router.id === (transport as any)?.internal.routerId
        )!

        await Promise.all(
          networkTransport.routers.instance.map(async (router) => {
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
          networkTransport.dataProducers.delete(label)
          logger.info("data producer's transport closed: " + dataProducer.id)
          dataProducer.close()
          world.clients.get(userId)!.dataProducers!.delete(label)
        })
        const internalConsumer = await createInternalDataConsumer(networkTransport, dataProducer, userId)
        if (internalConsumer) {
          if (!world.clients.has(userId)) {
            logger.error('Client no longer exists.')
            return callback({ error: 'Client no longer exists.' })
          }
          world.clients.get(userId)!.dataConsumers!.set(label, internalConsumer)
          // transport.handleConsumeDataEvent(socket);
          logger.info('transport.handleConsumeDataEvent(socket)')
          // Possibly do stuff with appData here
          logger.info('Sending dataproducer id to client: ' + dataProducer.id)
          return callback({ id: dataProducer.id })
        } else {
          logger.error('Invalid data producer.')
          return callback({ error: 'Invalid data producer.' })
        }
      } else {
        logger.error('Client no longer exists.')
        return callback({ error: 'Client no longer exists.' })
      }
    } catch (e) {
      logger.error(e, 'handleWebRtcProduceData')
    }
  } else {
    logger.error('Invalid transport.')
    return callback({ error: 'Invalid transport.' })
  }
}

export async function handleWebRtcTransportClose(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
) {
  const { transportId } = data
  const transport = networkTransport.mediasoupTransports[transportId]
  if (transport) {
    await closeTransport(networkTransport, transport).catch((err) =>
      logger.error(err, 'Error closing WebRTC transport.')
    )
  }
  callback({ closed: true })
}

export async function handleWebRtcTransportConnect(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
) {
  const { transportId, dtlsParameters } = data,
    transport = networkTransport.mediasoupTransports[transportId]
  if (transport) {
    const pending = networkTransport.transportsConnectPending[transportId] ?? transport.connect({ dtlsParameters })
    pending
      .then(() => {
        callback({ connected: true })
      })
      .catch((err) => {
        logger.error(err, 'handleWebRtcTransportConnect, data: %o', data)
        callback({ connected: false })
      })
    networkTransport.transportsConnectPending[transportId] = pending
  } else {
    logger.error('Invalid transport.')
    return callback({ error: 'Invalid transport.' })
  }
}

export async function handleWebRtcCloseProducer(networkTransport: SocketWebRTCServerTransport, socket, data, callback) {
  const { producerId } = data
  const producer = MediaStreams.instance?.producers.find((p) => p.id === producerId)
  try {
    await closeProducerAndAllPipeProducers(producer)
  } catch (err) {
    logger.error(err, 'Error closing WebRTC producer.')
  }
  callback({ closed: true })
}

export async function handleWebRtcSendTrack(networkTransport: SocketWebRTCServerTransport, socket, data, callback) {
  const userId = getUserIdFromSocketId(socket.id)
  const { transportId, kind, rtpParameters, paused = false, appData } = data
  const transport = networkTransport.mediasoupTransports[transportId]

  if (!transport) {
    logger.error('Invalid transport ID.')
    return callback({ error: 'Invalid transport ID.' })
  }

  try {
    const newProducerAppData = { ...appData, peerId: userId, transportId }
    const existingProducer = await MediaStreams.instance?.producers.find(
      (producer) => producer.appData === newProducerAppData
    )
    if (existingProducer) await closeProducer(existingProducer)
    const producer = await transport.produce({
      kind,
      rtpParameters,
      paused,
      appData: newProducerAppData
    })

    const routers = networkTransport.routers[`${appData.channelType}:${appData.channelId}`]
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

    producer.on('transportclose', () => closeProducerAndAllPipeProducers(producer))

    if (!MediaStreams.instance?.producers) {
      logger.warn('Media stream producers is undefined.')
    }
    MediaStreams.instance?.producers?.push(producer)

    const world = Engine.instance.currentWorld
    if (userId && world.clients.has(userId)) {
      world.clients.get(userId)!.media![appData.mediaTag] = {
        paused,
        producerId: producer.id,
        globalMute: false,
        encodings: rtpParameters.encodings,
        channelType: appData.channelType,
        channelId: appData.channelId
      }
    }

    for (const [clientUserId, client] of world.clients) {
      if (clientUserId !== userId && client.socket) {
        client.socket!.emit(
          MessageTypes.WebRTCCreateProducer.toString(),
          userId,
          appData.mediaTag,
          producer.id,
          appData.channelType,
          appData.channelId
        )
      }
    }
    callback({ id: producer.id })
  } catch (err) {
    logger.error(err, 'Error with sendTrack.')
    callback({ error: 'Error with sendTrack: ' + err })
  }
}

export async function handleWebRtcReceiveTrack(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const world = Engine.instance.currentWorld
  const userId = getUserIdFromSocketId(socket.id)!
  const { mediaPeerId, mediaTag, rtpCapabilities, channelType, channelId } = data
  const producer = MediaStreams.instance.producers.find(
    (p) =>
      p.appData.mediaTag === mediaTag &&
      p.appData.peerId === mediaPeerId &&
      (channelType === 'instance'
        ? p.appData.channelType === channelType
        : p.appData.channelType === channelType && p.appData.channelId === channelId)
  )

  const transport = Object.values(networkTransport.mediasoupTransports).find(
    (t) =>
      (t as any).appData.peerId === userId &&
      (t as any).appData.clientDirection === 'recv' &&
      (channelType === 'instance'
        ? (t as any).appData.channelType === channelType
        : (t as any).appData.channelType === channelType && (t as any).appData.channelId === channelId) &&
      (t as any).closed === false
  )!
  // @todo: the 'any' cast here is because WebRtcTransport.internal is protected - we should see if this is the proper accessor
  const router = networkTransport.routers[`${channelType}:${channelId}`].find(
    (router) => router.id === (transport as any)?.internal.routerId
  )
  if (!producer || !router || !router.canConsume({ producerId: producer.id, rtpCapabilities })) {
    const msg = `Client cannot consume ${mediaPeerId}:${mediaTag}, ${producer}`
    logger.error(`recv-track: ${userId} ${msg}`)
    return callback({ error: msg })
  }

  if (transport) {
    try {
      const consumer = await (transport as any).consume({
        producerId: producer.id,
        rtpCapabilities,
        paused: true, // see note above about always starting paused
        appData: { peerId: userId, mediaPeerId, mediaTag, channelType: channelType, channelId: channelId }
      })

      // we need both 'transportclose' and 'producerclose' event handlers,
      // to make sure we close and clean up consumers in all circumstances
      consumer.on('transportclose', () => {
        logger.info(`Consumer's transport closed, consumer.id: "${consumer.id}".`)
        closeConsumer(consumer)
      })
      consumer.on('producerclose', () => {
        logger.info(`Consumer's producer closed, consumer.id: "${consumer.id}".`)
        closeConsumer(consumer)
      })
      consumer.on('producerpause', () => {
        if (consumer && typeof consumer.pause === 'function') {
          networkTransport.mediasoupOperationQueue.add({
            object: consumer,
            action: 'pause'
          })
        }
        socket.emit(MessageTypes.WebRTCPauseConsumer.toString(), consumer.id)
      })
      consumer.on('producerresume', () => {
        if (consumer && typeof consumer.resume === 'function')
          networkTransport.mediasoupOperationQueue.add({
            object: consumer,
            action: 'resume'
          })
        socket.emit(MessageTypes.WebRTCResumeConsumer.toString(), consumer.id)
      })

      // stick this consumer in our list of consumers to keep track of
      MediaStreams.instance?.consumers.push(consumer)

      if (world.clients.has(userId)) {
        world.clients.get(userId)!.consumerLayers![consumer.id] = {
          currentLayer: null,
          clientSelectedLayer: null
        }
      }

      // update above data structure when layer changes.
      consumer.on('layerschange', (layers) => {
        if (world.clients.has(userId) && world.clients.get(userId)!.consumerLayers![consumer.id]) {
          world.clients.get(userId)!.consumerLayers![consumer.id].currentLayer = layers && layers.spatialLayer
        }
      })

      callback({
        producerId: producer.id,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        producerPaused: consumer.producerPaused
      })
    } catch (err) {
      logger.error(err, 'Error consuming transport %o.', transport)
      callback({ error: 'Transport to consume no longer exists.' })
    }
  } else {
    callback({
      id: null
    })
  }
}

export async function handleWebRtcPauseConsumer(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const { consumerId } = data
  const consumer = MediaStreams.instance?.consumers.find((c) => c.id === consumerId)
  if (consumer) {
    networkTransport.mediasoupOperationQueue.add({
      object: consumer,
      action: 'pause'
    })
  }
  callback({ paused: true })
}

export async function handleWebRtcResumeConsumer(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const { consumerId } = data
  const consumer = MediaStreams.instance?.consumers.find((c) => c.id === consumerId)
  if (consumer) {
    networkTransport.mediasoupOperationQueue.add({
      object: consumer,
      action: 'resume'
    })
  }
  callback({ resumed: true })
}

export async function handleWebRtcCloseConsumer(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const { consumerId } = data
  const consumer = MediaStreams.instance?.consumers.find((c) => c.id === consumerId)
  if (consumer) {
    await closeConsumer(consumer)
  }
  callback({ closed: true })
}

export async function handleWebRtcConsumerSetLayers(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const { consumerId, spatialLayer } = data,
    consumer = MediaStreams.instance?.consumers.find((c) => c.id === consumerId)
  logger.info('consumer-set-layers: %o, %o', spatialLayer, consumer.appData)
  await consumer.setPreferredLayers({ spatialLayer })
  callback({ layersSet: true })
}

export async function handleWebRtcResumeProducer(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)
  const { producerId } = data
  const producer = MediaStreams.instance?.producers.find((p) => p.id === producerId)
  logger.info('resume-producer: %o', producer?.appData)
  if (producer) {
    networkTransport.mediasoupOperationQueue.add({
      object: producer,
      action: 'resume'
    })
    // await producer.resume();
    const world = Engine.instance.currentWorld
    if (userId && world.clients.has(userId)) {
      world.clients.get(userId)!.media![producer.appData.mediaTag].paused = false
      world.clients.get(userId)!.media![producer.appData.mediaTag].globalMute = false
      const hostClient = Array.from(world.clients.entries()).find(([, client]) => {
        return client.media && client.media![producer.appData.mediaTag]?.producerId === producerId
      })!
      if (hostClient && hostClient[1]) {
        hostClient[1].socket!.emit(MessageTypes.WebRTCResumeProducer.toString(), producer.id)
      }
    }
  }
  callback({ resumed: true })
}

export async function handleWebRtcPauseProducer(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)
  const world = Engine.instance.currentWorld
  const { producerId, globalMute } = data
  const producer = MediaStreams.instance?.producers.find((p) => p.id === producerId)
  if (producer) {
    networkTransport.mediasoupOperationQueue.add({
      object: producer,
      action: 'pause'
    })
    if (userId && world.clients.has(userId) && world.clients.get(userId)!.media![producer.appData.mediaTag]) {
      world.clients.get(userId)!.media![producer.appData.mediaTag].paused = true
      world.clients.get(userId)!.media![producer.appData.mediaTag].globalMute = globalMute || false
      if (globalMute === true) {
        const hostClient = Array.from(world.clients.entries()).find(([, client]) => {
          return client.media && client.media![producer.appData.mediaTag]?.producerId === producerId
        })!
        if (hostClient && hostClient[1]) {
          hostClient[1].socket!.emit(MessageTypes.WebRTCPauseProducer.toString(), producer.id, true)
        }
      }
    }
  }
  callback({ paused: true })
}

export async function handleWebRtcRequestNearbyUsers(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const userId = getUserIdFromSocketId(socket.id)!
  const world = Engine.instance.currentWorld
  const selfClient = world.clients.get(userId)!
  if (selfClient?.socketId) {
    const nearbyUsers = getNearbyUsers(userId)
    const nearbyUserIds = !nearbyUsers ? [] : nearbyUsers.map((user) => user.id)
    callback({ userIds: nearbyUserIds })
  } else {
    callback({ userIds: [] })
  }
}

export async function handleWebRtcRequestCurrentProducers(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const { userIds, channelType, channelId } = data

  await sendCurrentProducers(socket, userIds || [], channelType, channelId)
  callback({ requested: true })
}

export async function handleWebRtcInitializeRouter(
  networkTransport: SocketWebRTCServerTransport,
  socket,
  data,
  callback
): Promise<any> {
  const { channelType, channelId } = data
  if (!(channelType === 'instance' && !channelId)) {
    const mediaCodecs = localConfig.mediasoup.router.mediaCodecs as RtpCodecCapability[]
    if (!networkTransport.routers[`${channelType}:${channelId}`]) {
      logger.info(`Making new routers for channelId "${channelId}".`)
      networkTransport.routers[`${channelType}:${channelId}`] = []
      await Promise.all(
        networkTransport.workers.map(async (worker) => {
          const newRouter = await worker.createRouter({ mediaCodecs })
          networkTransport.routers[`${channelType}:${channelId}`].push(newRouter)
        })
      )
    }
  }
  callback({ initialized: true })
}
