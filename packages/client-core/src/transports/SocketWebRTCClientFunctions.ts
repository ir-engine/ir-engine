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

import * as mediasoupClient from 'mediasoup-client'
import {
  Consumer,
  DataProducer,
  DtlsParameters,
  MediaKind,
  Transport as MediaSoupTransport,
  Producer,
  RtpParameters,
  SctpStreamParameters
} from 'mediasoup-client/lib/types'
import { encode } from 'msgpackr'
import type { EventEmitter } from 'primus'
import Primus from 'primus-client'
import { v4 as uuidv4 } from 'uuid'

import config from '@ir-engine/common/src/config'
import { BotUserAgent } from '@ir-engine/common/src/constants/BotUserAgent'
import { MediaStreamAppData, NetworkConnectionParams } from '@ir-engine/common/src/interfaces/NetworkInterfaces'
import multiLogger from '@ir-engine/common/src/logger'
import {
  ChannelID,
  InstanceID,
  InviteCode,
  LocationID,
  RoomCode,
  UserID
} from '@ir-engine/common/src/schema.type.module'
import { getSearchParamFromURL } from '@ir-engine/common/src/utils/getSearchParamFromURL'
import { AuthTask, ReadyTask } from '@ir-engine/common/src/world/receiveJoinWorld'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { defineSystem, destroySystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import {
  Action,
  NetworkID,
  PeerID,
  Topic,
  addOutgoingTopicIfNecessary,
  defineActionQueue,
  dispatchAction,
  getMutableState,
  getState,
  none,
  removeActionQueue
} from '@ir-engine/hyperflux'
import {
  DataChannelType,
  NetworkActions,
  NetworkPeerFunctions,
  NetworkState,
  NetworkTopics,
  VideoConstants,
  addNetwork,
  createNetwork,
  removeNetwork,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@ir-engine/network'

import {
  MediasoupDataProducerActions,
  MediasoupDataProducerConsumerState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupDataProducerConsumerState'
import {
  MediasoupMediaConsumerActions,
  MediasoupMediaConsumerType,
  MediasoupMediaProducerActions,
  MediasoupMediaProducerConsumerState,
  MediasoupMediaProducersConsumersObjectsState
} from '@ir-engine/common/src/transports/mediasoup/MediasoupMediaProducerConsumerState'
import {
  MediasoupTransportActions,
  MediasoupTransportObjectsState,
  MediasoupTransportState,
  TransportType
} from '@ir-engine/common/src/transports/mediasoup/MediasoupTransportState'
import { LocationInstanceState } from '../common/services/LocationInstanceConnectionService'
import { MediaInstanceState } from '../common/services/MediaInstanceConnectionService'
import { ChannelState } from '../social/services/ChannelService'
import { LocationState } from '../social/services/LocationService'
import { AuthState } from '../user/services/AuthService'
import { clientContextParams } from '../util/contextParams'
import { MediaStreamService, MediaStreamState } from './MediaStreams'

const logger = multiLogger.child({
  component: 'client-core:SocketWebRTCClientFunctions',
  modifier: clientContextParams
})

export type WebRTCTransportExtension = Omit<MediaSoupTransport, 'appData'> & { appData: MediaStreamAppData }
export type ProducerExtension = Omit<Producer, 'appData'> & { appData: MediaStreamAppData }
export type ConsumerExtension = Omit<Consumer, 'appData'> & { appData: MediaStreamAppData }

const instanceStillProvisioned = (instanceID: InstanceID, locationID?: LocationID, channelID?: ChannelID) =>
  !!(
    (locationID && getState(LocationInstanceState).instances[instanceID]) ||
    (channelID && getState(MediaInstanceState).instances[instanceID])
  )

const unprovisionInstance = (topic: Topic, instanceID: InstanceID) => {
  if (topic === NetworkTopics.world) {
    const locationInstanceConnectionState = getMutableState(LocationInstanceState)
    locationInstanceConnectionState.instances[instanceID].set(none)
  } else {
    const mediaInstanceConnectionState = getMutableState(MediaInstanceState)
    mediaInstanceConnectionState.instances[instanceID].set(none)
  }
}

export const closeNetwork = (network: SocketWebRTCClientNetwork) => {
  clearInterval(network.heartbeat)
  network.primus?.removeAllListeners()
  network.primus?.end()
  removeNetwork(network)
  /** Dispatch updatePeers locally to ensure event souce states know about this */
  dispatchAction(
    NetworkActions.updatePeers({
      peers: [],
      $to: Engine.instance.store.peerID,
      $topic: network.topic,
      $network: network.id
    })
  )
}

export const initializeNetwork = (id: InstanceID, hostPeerID: PeerID, topic: Topic, primus: Primus) => {
  const mediasoupDevice = new mediasoupClient.Device(
    navigator.userAgent === BotUserAgent ? { handlerName: 'Chrome74' } : undefined
  )

  const network = createNetwork(id, hostPeerID, topic, {
    mediasoupDevice,
    primus,
    heartbeat: setInterval(() => {
      network.messageToPeer(network.hostPeerID, [])
    }, 1000)
  })

  return network
}

export type SocketWebRTCClientNetwork = ReturnType<typeof initializeNetwork>

export const connectToInstance = (
  instanceID: InstanceID,
  ipAddress: string,
  port: string,
  locationID?: LocationID,
  channelID?: ChannelID,
  roomCode?: RoomCode
) => {
  let primus: Primus | undefined
  let connectionFailTimeout: NodeJS.Timeout | undefined
  let aborted = false
  let connecting = true

  // wrap the connect function in a closure to allow for recursive calls and single useEffect cleanup
  const _connect = () => {
    aborted = false
    connecting = true

    logger.info('Connecting to instance type: %o', { instanceID, ipAddress, port, locationID, channelID, roomCode })

    const authState = getState(AuthState)
    const token = authState.authUser.accessToken

    const query: NetworkConnectionParams = {
      instanceID,
      locationId: locationID,
      channelId: channelID,
      roomCode,
      token
    }

    if (locationID) delete query.channelId
    if (channelID) delete query.locationId
    if (!roomCode) delete query.roomCode

    try {
      if (
        config.client.localBuild === 'true' ||
        (config.client.appEnv === 'development' && config.client.localNginx !== 'true')
      ) {
        const queryString = new URLSearchParams(query).toString()
        primus = new Primus(`https://${ipAddress as string}:${port.toString()}?${queryString}`)
      } else {
        query.address = ipAddress
        query.port = port.toString()
        const queryString = new URLSearchParams(query).toString()
        primus = new Primus(`${config.client.instanceserverUrl}?${queryString}`)
      }
    } catch (err) {
      logger.error('Failed to connect to primus', err)
      // TODO: do we want to unprovision here?
      return unprovisionInstance(locationID ? NetworkTopics.world : NetworkTopics.media, instanceID)
    }

    connectionFailTimeout = setTimeout(() => {
      if (aborted || !primus) return
      primus.removeAllListeners()
      primus.end()
      /** If we still have the instance provisioned, we should try again */
      if (instanceStillProvisioned(instanceID, locationID, channelID)) _connect()
    }, 3000)

    const onConnect = async () => {
      if (aborted || !primus) return
      connecting = false
      primus.off('incoming::open', onConnect)
      logger.info('CONNECTED to port %o', { port })

      clearTimeout(connectionFailTimeout)

      const topic = locationID ? NetworkTopics.world : NetworkTopics.media
      const instanceserverReady = await checkInstanceserverReady(primus, instanceID, topic)
      if (instanceserverReady) {
        await authenticatePrimus(primus, instanceID, topic)

        /** Server closed the connection. */
        const onDisconnect = () => {
          if (aborted) return
          if (primus) {
            primus.off('incoming::end', onDisconnect)
            primus.off('end', onDisconnect)
          }
          const network = getState(NetworkState).networks[instanceID] as SocketWebRTCClientNetwork
          if (!network) return logger.error('Disconnected from unconnected instance ' + instanceID)

          logger.info('Disconnected from network %o', { topic: network.topic, id: network.id })
          /**
           * If we are disconnected (server closes our socket) rather than leave the network,
           * we just need to destroy and recreate the transport
           */
          closeNetwork(network)
          /** If we still have the instance provisioned, we should try again */
          if (instanceStillProvisioned(instanceID, locationID, channelID)) _connect()
        }
        // incoming::end is emitted when the server closes the connection
        primus.on('incoming::end', onDisconnect)
        // end is emitted when the client closes the connection
        primus.on('end', onDisconnect)
      } else {
        if (locationID) {
          const currentLocation = getMutableState(LocationState).currentLocation.location
          const currentLocationId = currentLocation.id.value
          currentLocation.id.set(undefined as unknown as LocationID)
          currentLocation.id.set(currentLocationId)
        } else {
          const channelState = getMutableState(ChannelState)
          const targetChannelId = channelState.targetChannelId.value
          channelState.targetChannelId.set(undefined as unknown as ChannelID)
          channelState.targetChannelId.set(targetChannelId)
        }
        primus.removeAllListeners()
        primus.end()
        console.log('PRIMUS GONE')
      }
    }
    primus!.on('incoming::open', onConnect)
  }

  _connect()

  return () => {
    aborted = true
    if (connecting) {
      if (connectionFailTimeout) clearTimeout(connectionFailTimeout)
      if (!primus) return
      primus.removeAllListeners()
      primus.end()
    } else {
      const network = getState(NetworkState).networks[instanceID] as SocketWebRTCClientNetwork | undefined
      if (network) leaveNetwork(network)
    }
  }
}

export const getChannelIdFromTransport = (network: SocketWebRTCClientNetwork) => {
  const channelConnectionState = getState(MediaInstanceState)
  const mediaNetwork = NetworkState.mediaNetwork
  const currentChannelInstanceConnection = mediaNetwork && channelConnectionState.instances[mediaNetwork.id]
  const isWorldConnection = network.topic === NetworkTopics.world
  return isWorldConnection ? null : currentChannelInstanceConnection?.channelId
}

export async function checkInstanceserverReady(primus: Primus, instanceID: InstanceID, topic: Topic) {
  logger.info('Checking that instanceserver is ready')
  const { instanceReady } = await new Promise<ReadyTask>((resolve) => {
    const onStatus = (response: ReadyTask) => {
      // eslint-disable-next-line no-prototype-builtins
      if (response.hasOwnProperty('instanceReady')) {
        clearInterval(interval)
        resolve(response)
        primus.off('data', onStatus)
        primus.removeListener('incoming::end', onDisconnect)
      }
    }

    primus.on('data', onStatus)

    let disconnected = false
    const interval = setInterval(() => {
      if (disconnected) {
        clearInterval(interval)
        resolve({ instanceReady: false })
        primus.removeAllListeners()
        primus.end()
        return
      }
    }, 100)

    const onDisconnect = () => {
      disconnected = true
    }
    primus.addListener('incoming::end', onDisconnect)
  })

  if (!instanceReady) {
    unprovisionInstance(topic, instanceID)
  }

  return instanceReady
}

export async function authenticatePrimus(primus: Primus, instanceID: InstanceID, topic: Topic) {
  logger.info('Authenticating instance ' + instanceID)

  const authState = getState(AuthState)
  const accessToken = authState.authUser.accessToken
  const inviteCode = getSearchParamFromURL('inviteCode') as InviteCode
  const payload = { accessToken, peerID: Engine.instance.store.peerID, inviteCode }

  const { status, routerRtpCapabilities, cachedActions, error, hostPeerID } = await new Promise<AuthTask>((resolve) => {
    const onAuthentication = (response: AuthTask) => {
      if (response.status !== 'pending') {
        clearInterval(interval)
        resolve(response)
        primus.off('data', onAuthentication)
        primus.removeListener('incoming::end', onDisconnect)
      }
    }

    primus.on('data', onAuthentication)

    let disconnected = false
    const interval = setInterval(() => {
      if (disconnected) {
        clearInterval(interval)
        resolve({ status: 'fail' })
        primus.removeAllListeners()
        primus.end()
        return
      }
      primus.write(payload)
    }, 100)

    const onDisconnect = () => {
      disconnected = true
    }
    primus.addListener('incoming::end', onDisconnect)
  })

  if (status !== 'success') {
    /** We failed to connect to be authenticated, we do not want to try again */
    // TODO: do we want to unprovision here?
    unprovisionInstance(topic, instanceID)
    return logger.error(new Error('Unable to connect with credentials ' + error))
  }

  await connectToNetwork(primus, instanceID, topic, hostPeerID!, routerRtpCapabilities!, cachedActions!)
}

export const connectToNetwork = async (
  primus: Primus,
  instanceID: InstanceID,
  topic: Topic,
  hostPeerID: PeerID,
  routerRtpCapabilities: any,
  cachedActions: Required<Action>[]
) => {
  /** Check if a network already exists */
  const existingNetwork = getState(NetworkState).networks[instanceID]
  if (!existingNetwork) {
    getMutableState(NetworkState).hostIds[topic].set(instanceID)
    const network = initializeNetwork(instanceID, hostPeerID, topic, primus)
    addNetwork(network)
  }

  const network = getState(NetworkState).networks[instanceID] as SocketWebRTCClientNetwork

  network.primus.on('data', (message) => {
    if (!message) return
    console.log('MESSAGE', message)
    network.onMessage(network.hostPeerID, message)
  })

  const message = (data) => {
    network.primus.write(data)
  }

  const buffer = (dataChannelType: DataChannelType, data: any) => {
    const fromPeerID = Engine.instance.store.peerID
    const dataProducer = MediasoupDataProducerConsumerState.getProducerByDataChannel(network.id, dataChannelType) as
      | DataProducer
      | undefined
    if (!dataProducer) return
    if (dataProducer.closed || dataProducer.readyState !== 'open') return
    const fromPeerIndex = network.peerIDToPeerIndex[fromPeerID]
    if (typeof fromPeerIndex === 'undefined')
      return console.warn('fromPeerIndex is undefined', fromPeerID, fromPeerIndex)
    dataProducer.send(encode([fromPeerIndex, data]))
  }

  // we can assume that the host peer is always first to connect
  NetworkPeerFunctions.createPeer(network, hostPeerID, 0, instanceID as any as UserID, 0)
  network.peers[hostPeerID].transport = {
    message,
    buffer
  }

  addOutgoingTopicIfNecessary(network.topic)

  // handle cached actions
  for (const action of cachedActions!) Engine.instance.store.actions.incoming.push({ ...action, $fromCache: true })

  Engine.instance.store.actions.outgoing[network.topic].queue.push(
    ...Engine.instance.store.actions.outgoing[network.topic].history
  )

  if (!network.mediasoupDevice.loaded) {
    await network.mediasoupDevice.load({ routerRtpCapabilities })
    logger.info('Successfully loaded routerRtpCapabilities')
  }

  dispatchAction(
    MediasoupTransportActions.requestTransport({
      peerID: Engine.instance.store.peerID,
      direction: 'send',
      sctpCapabilities: network.mediasoupDevice.sctpCapabilities,
      $network: network.id,
      $topic: network.topic,
      $to: network.hostPeerID
    })
  )

  dispatchAction(
    MediasoupTransportActions.requestTransport({
      peerID: Engine.instance.store.peerID,
      direction: 'recv',
      sctpCapabilities: network.mediasoupDevice.sctpCapabilities,
      $network: network.id,
      $topic: network.topic,
      $to: network.hostPeerID
    })
  )

  logger.info('Successfully connected to instance type: %o', { topic: network.topic, id: network.id })
}

export const waitForTransports = async (network: SocketWebRTCClientNetwork) => {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (network.ready) {
        clearInterval(interval)
        resolve()
        return
      }
    }, 100)
  })
}

export const onTransportCreated = async (networkID: NetworkID, transportDefinition: TransportType) => {
  const network = getState(NetworkState).networks[networkID] as SocketWebRTCClientNetwork | undefined
  if (!network) return console.warn('Network not found', networkID)

  const channelId = getChannelIdFromTransport(network)
  const { transportID, direction, sctpParameters, iceParameters, iceCandidates, iceServers, dtlsParameters } =
    transportDefinition

  let transport: MediaSoupTransport

  const transportOptions = {
    id: transportDefinition.transportID,
    sctpParameters,
    iceParameters,
    iceCandidates,
    dtlsParameters,
    iceServers
  }

  if (direction === 'recv') {
    transport = await network.mediasoupDevice.createRecvTransport(transportOptions)
  } else if (direction === 'send') {
    transport = await network.mediasoupDevice.createSendTransport(transportOptions)
  } else throw new Error(`bad transport 'direction': ${direction}`)

  // mediasoup-client will emit a connect event when media needs to
  // start flowing for the first time. send dtlsParameters to the
  // server, then call callback() on success or errback() on failure.

  transport.on(
    'connect',
    async (
      { dtlsParameters }: { dtlsParameters: DtlsParameters },
      callback: () => void,
      errback: (error: Error) => void
    ) => {
      const requestID = uuidv4()
      dispatchAction(
        MediasoupTransportActions.requestTransportConnect({
          requestID,
          transportID,
          dtlsParameters,
          $network: network.id,
          $topic: network.topic,
          $to: network.hostPeerID
        })
      )

      //  TODO - this is an anti pattern, how else can we resolve this? inject a system?
      try {
        const transportConnected = await new Promise<any>((resolve, reject) => {
          const actionQueue = defineActionQueue(MediasoupTransportActions.transportConnected.matches)
          const errorQueue = defineActionQueue(MediasoupTransportActions.requestTransportConnectError.matches)

          const cleanup = () => {
            destroySystem(systemUUID)
            removeActionQueue(actionQueue)
            removeActionQueue(errorQueue)
          }

          const systemUUID = defineSystem({
            uuid: '[WebRTC] transport connected ' + transportID,
            insert: { after: PresentationSystemGroup },
            execute: () => {
              for (const action of actionQueue()) {
                if (action.requestID !== requestID) return
                cleanup()
                resolve(action)
              }
              for (const action of errorQueue()) {
                if (action.requestID !== requestID) return
                cleanup()
                logger.error(action.error)
                reject(new Error(action.error))
              }
            }
          })
        })
        callback()
      } catch (e) {
        logger.error('Transport connect error', e)
        errback(e)
      }
    }
  )

  if (direction === 'send') {
    transport.on(
      'produce',
      async (
        {
          kind,
          rtpParameters,
          appData
        }: { kind: MediaKind; rtpParameters: RtpParameters; appData: MediaStreamAppData },
        callback: (arg0: { id: string }) => void,
        errback: (error: Error) => void
      ) => {
        const mediaStreamState = getMutableState(MediaStreamState)
        let paused = false

        switch (appData.mediaTag) {
          case webcamVideoDataChannelType:
            paused = mediaStreamState.videoEnabled.value
            break
          case webcamAudioDataChannelType:
            paused = mediaStreamState.audioEnabled.value
            break
          case screenshareVideoDataChannelType:
            paused = mediaStreamState.screenShareVideoPaused.value
            break
          case screenshareAudioDataChannelType:
            paused = mediaStreamState.screenShareAudioPaused.value
            break
          default:
            return logger.error('Unkown media type on transport produce', appData.mediaTag)
        }

        // tell the server what it needs to know from us in order to set
        // up a server-side producer object, and get back a
        // producer.id. call callback() on success or errback() on
        // failure.
        const requestID = uuidv4()
        dispatchAction(
          MediasoupMediaProducerActions.requestProducer({
            requestID,
            transportID,
            kind,
            rtpParameters,
            paused,
            appData,
            $network: network.id,
            $topic: network.topic,
            $to: network.hostPeerID
          })
        )

        //  TODO - this is an anti pattern, how else can we resolve this? inject a system?
        try {
          const producerPromise = await new Promise<any>((resolve, reject) => {
            const actionQueue = defineActionQueue(MediasoupMediaProducerActions.producerCreated.matches)
            const errorQueue = defineActionQueue(MediasoupMediaProducerActions.requestProducerError.matches)

            const cleanup = () => {
              destroySystem(systemUUID)
              removeActionQueue(actionQueue)
              removeActionQueue(errorQueue)
            }

            const systemUUID = defineSystem({
              uuid: '[WebRTC] media producer ' + requestID,
              insert: { after: PresentationSystemGroup },
              execute: () => {
                for (const action of actionQueue()) {
                  if (action.requestID !== requestID) return
                  cleanup()
                  resolve(action)
                }
                for (const action of errorQueue()) {
                  if (action.requestID !== requestID) return
                  cleanup()
                  logger.error(action.error)
                  reject(new Error(action.error))
                }
              }
            })
          })
          callback({ id: producerPromise.producerID })
        } catch (e) {
          errback(e)
        }
      }
    )

    transport.on(
      'producedata',
      async (
        parameters: {
          sctpStreamParameters: SctpStreamParameters
          label: DataChannelType
          protocol: string
          appData: Record<string, unknown>
        },
        callback: (arg0: { id: string }) => void,
        errback: (error: Error) => void
      ) => {
        const { sctpStreamParameters, label, protocol, appData } = parameters

        const requestID = uuidv4()
        dispatchAction(
          MediasoupDataProducerActions.requestProducer({
            requestID,
            transportID: transportOptions.id,
            sctpStreamParameters,
            dataChannel: label,
            protocol,
            appData,
            $network: network.id,
            $topic: network.topic,
            $to: network.hostPeerID
          })
        )

        //  TODO - this is an anti pattern, how else can we resolve this? inject a system?
        try {
          const producerPromise = await new Promise<any>((resolve, reject) => {
            const actionQueue = defineActionQueue(MediasoupDataProducerActions.producerCreated.matches)
            const errorQueue = defineActionQueue(MediasoupDataProducerActions.requestProducerError.matches)

            const cleanup = () => {
              destroySystem(systemUUID)
              removeActionQueue(actionQueue)
              removeActionQueue(errorQueue)
            }

            const systemUUID = defineSystem({
              uuid: '[WebRTC] data producer ' + requestID,
              insert: { after: PresentationSystemGroup },
              execute: () => {
                for (const action of actionQueue()) {
                  if (action.requestID !== requestID) return
                  cleanup()
                  resolve(action)
                }
                for (const action of errorQueue()) {
                  if (action.requestID !== requestID) return
                  cleanup()
                  logger.error(action.error)
                  reject(new Error(action.error))
                }
              }
            })
          })
          callback({ id: producerPromise.producerID })
        } catch (e) {
          errback(e)
        }
      }
    )
  }

  // any time a transport transitions to closed,
  // failed, or disconnected, leave the  and reset
  transport.on('connectionstatechange', async (state: string) => {
    if (state === 'closed' || state === 'failed' || state === 'disconnected') {
      logger.error(network.topic + 'Transport %o transitioned to state ' + state, transport)
      logger.error(
        'If this occurred unexpectedly shortly after joining a world, check that the instanceserver nodegroup has public IP addresses.'
      )
      logger.info('Waiting 5 seconds to make a new transport')
      setTimeout(() => {
        logger.info('Re-creating transport after unexpected closing/fail/disconnect %o', {
          topic: network.topic,
          direction,
          channelId
        })
        // ensure the network still exists and we want to re-create the transport
        if (!getState(NetworkState).networks[network.id] || !network.primus || network.primus.disconnect) return

        const transportID = MediasoupTransportState.getTransport(network.id, direction, Engine.instance.store.peerID)
        getMutableState(MediasoupTransportState)[network.id][transportID].set(none)

        dispatchAction(
          MediasoupTransportActions.requestTransport({
            peerID: Engine.instance.store.peerID,
            direction,
            sctpCapabilities: network.mediasoupDevice.sctpCapabilities,
            $network: network.id,
            $topic: network.topic,
            $to: network.hostPeerID
          })
        )
      }, 5000)
    }
  })

  getMutableState(MediasoupTransportObjectsState)[transportID].set(transport)
}

const getCodecEncodings = (service: string) => {
  const mediaSettings = config.client.mediaSettings
  const settings = service === 'video' ? mediaSettings.video : mediaSettings.screenshare
  let codec, encodings
  if (settings) {
    switch (settings.codec) {
      case 'VP9':
        codec = VideoConstants.VP9_CODEC
        encodings = VideoConstants.CAM_VIDEO_SVC_CODEC_OPTIONS
        break
      case 'h264':
        codec = VideoConstants.H264_CODEC
        encodings = VideoConstants.CAM_VIDEO_SIMULCAST_ENCODINGS
        encodings[0].maxBitrate = settings.lowResMaxBitrate * 1000
        encodings[1].maxBitrate = settings.midResMaxBitrate * 1000
        encodings[2].maxBitrate = settings.highResMaxBitrate * 1000
        break
      case 'VP8':
        codec = VideoConstants.VP8_CODEC
        encodings = VideoConstants.CAM_VIDEO_SIMULCAST_ENCODINGS
        encodings[0].maxBitrate = settings.lowResMaxBitrate * 1000
        encodings[1].maxBitrate = settings.midResMaxBitrate * 1000
        encodings[2].maxBitrate = settings.highResMaxBitrate * 1000
    }
  }

  return { codec, encodings }
}


export const receiveConsumerHandler = async (networkID: NetworkID, consumerState: MediasoupMediaConsumerType) => {
  const network = getState(NetworkState).networks[networkID] as SocketWebRTCClientNetwork

  const { peerID, mediaTag, channelID, paused } = consumerState

  const transport = MediasoupTransportState.getTransport(network.id, 'recv') as WebRTCTransportExtension
  if (!transport) return logger.error('No transport found for consumer')

  const consumer = (await transport.consume({
    id: consumerState.consumerID,
    producerId: consumerState.producerID,
    rtpParameters: consumerState.rtpParameters as any,
    kind: consumerState.kind!,
    appData: { peerID, mediaTag, channelId: channelID }
  })) as unknown as ConsumerExtension

  // if we do already have a consumer, we shouldn't have called this method
  const existingConsumer = MediasoupMediaProducerConsumerState.getConsumerByPeerIdAndMediaTag(
    network.id,
    peerID,
    mediaTag
  ) as ConsumerExtension

  if (!existingConsumer) {
    getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers[consumer.id].set(consumer)
    // okay, we're ready. let's ask the peer to send us media
    if (!paused) MediasoupMediaProducerConsumerState.resumeConsumer(network, consumer.id)
    else MediasoupMediaProducerConsumerState.pauseConsumer(network, consumer.id)
  } else if (existingConsumer.track?.muted) {
    dispatchAction(
      MediasoupMediaConsumerActions.consumerClosed({
        consumerID: existingConsumer.id,
        $network: network.id,
        $topic: network.topic,
        $to: peerID
      })
    )
    getMutableState(MediasoupMediaProducersConsumersObjectsState).consumers[consumer.id].set(consumer)
    // okay, we're ready. let's ask the peer to send us media
    if (!paused) {
      MediasoupMediaProducerConsumerState.resumeConsumer(network, consumer.id)
    } else {
      MediasoupMediaProducerConsumerState.pauseConsumer(network, consumer.id)
    }
  } else {
    dispatchAction(
      MediasoupMediaConsumerActions.consumerClosed({
        consumerID: consumer.id,
        $network: network.id,
        $topic: network.topic,
        $to: peerID
      })
    )
  }
}

export const toggleMicrophonePaused = () => {
  getMutableState(MediaStreamState).audioEnabled.set(val => !val)
}

export const toggleWebcamPaused = async () => {
  getMutableState(MediaStreamState).videoEnabled.set(val => !val)
}

export const toggleScreenshare = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = NetworkState.mediaNetwork as SocketWebRTCClientNetwork
  if (mediaStreamState.screenVideoProducer.value) await stopScreenshare(mediaNetwork)
  else await startScreenshare(mediaNetwork)
}

export const toggleScreenshareAudioPaused = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = NetworkState.mediaNetwork as SocketWebRTCClientNetwork
  const audioPaused = mediaStreamState.screenShareAudioPaused.value
  if (audioPaused)
    MediasoupMediaProducerConsumerState.resumeProducer(mediaNetwork, mediaStreamState.screenAudioProducer.value!.id)
  else MediasoupMediaProducerConsumerState.pauseProducer(mediaNetwork, mediaStreamState.screenAudioProducer.value!.id)
  mediaStreamState.screenShareAudioPaused.set(!audioPaused)
}

export const toggleScreenshareVideoPaused = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = NetworkState.mediaNetwork as SocketWebRTCClientNetwork
  const videoPaused = mediaStreamState.screenShareVideoPaused.value
  if (videoPaused) await startScreenshare(mediaNetwork)
  else await stopScreenshare(mediaNetwork)
}

export function leaveNetwork(network: SocketWebRTCClientNetwork) {
  if (!network) return
  logger.info('Leaving network %o', { topic: network.topic, id: network.id })

  try {
    closeNetwork(network)

    if (network.topic === NetworkTopics.media) {
      getMutableState(NetworkState).hostIds.media.set(none)
    } else {
      getMutableState(NetworkState).hostIds.world.set(none)
      // if world has a media server connection
      if (NetworkState.mediaNetwork) {
        leaveNetwork(NetworkState.mediaNetwork as SocketWebRTCClientNetwork)
      }
    }
  } catch (err) {
    logger.error(err, 'Error with leave()')
  }
}

export const startScreenshare = async (network: SocketWebRTCClientNetwork) => {
  logger.info({ event_name: 'screen_share', event_value: true })
  const mediaStreamState = getMutableState(MediaStreamState)

  // get a screen share track
  try {
    const localScreen = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })
    if (!localScreen) {
      logger.error('No screen share track found')
      return
    }
    mediaStreamState.localScreen.set(localScreen)
  } catch (e) {
    /**
     * @todo if the system disallows, we should provide an onscreen modal to show how a user can enable
     * - apple disables screen sharing if the user has not enabled it in the system preferences for other browsers
     */
    logger.error(e, 'Error starting screen share')
    return
  }

  const channelConnectionState = getState(MediaInstanceState)
  const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
  const channelId = currentChannelInstanceConnection.channelId

  await waitForTransports(network)
  const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

  const { codec, encodings } = getCodecEncodings('screenshare')

  // create a producer for video
  const videoTracks = mediaStreamState.localScreen.value!.getVideoTracks()
  if (!videoTracks.length) return logger.error('No video tracks found for screen share')

  await Promise.all([
    new Promise(async (resolve) => {
      const videoProducer = (await transport.produce({
        track: mediaStreamState.localScreen.value!.getVideoTracks()[0],
        encodings,
        codecOptions: VideoConstants.CAM_VIDEO_SIMULCAST_CODEC_OPTIONS,
        codec,
        appData: { mediaTag: screenshareVideoDataChannelType, channelId }
      })) as any as ProducerExtension
      mediaStreamState.screenVideoProducer.set(videoProducer)

      getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[videoProducer.id].set(videoProducer)

      // handler for screen share stopped event (triggered by the
      // browser's built-in screen sharing ui)
      const producer = mediaStreamState.screenVideoProducer.value as ProducerExtension
      producer!.track!.onended = async () => {
        return stopScreenshare(network)
      }

      resolve(null)
    }),
    new Promise(async (resolve) => {
      // create a producer for audio, if we have it
      const audioTracks = mediaStreamState.localScreen.value!.getAudioTracks()
      if (audioTracks.length) {
        const audioProducer = (await transport.produce({
          track: audioTracks[0],
          appData: { mediaTag: screenshareAudioDataChannelType, channelId }
        })) as any as ProducerExtension
        mediaStreamState.screenAudioProducer.set(audioProducer)
        mediaStreamState.screenShareAudioPaused.set(false)
        getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[audioProducer.id].set(audioProducer)
      }
      resolve(null)
    })
  ])

  // set unpaused once we have both video and audio producers
  mediaStreamState.screenShareVideoPaused.set(false)
}

export const stopScreenshare = async (network: SocketWebRTCClientNetwork) => {
  logger.info({ event_name: 'screen_share', event_value: false })
  const mediaStreamState = getMutableState(MediaStreamState)

  console.log(mediaStreamState.screenVideoProducer.value, mediaStreamState.screenShareVideoPaused.value)
  if (mediaStreamState.screenVideoProducer.value) {
    dispatchAction(
      MediasoupMediaProducerActions.producerPaused({
        producerID: mediaStreamState.screenVideoProducer.value.id,
        globalMute: false,
        paused: true,
        $network: network.id,
        $topic: network.topic
      })
    )
    mediaStreamState.screenVideoProducer.value.pause()
    mediaStreamState.screenShareVideoPaused.set(true)
    dispatchAction(
      MediasoupMediaProducerActions.producerClosed({
        producerID: mediaStreamState.screenVideoProducer.value.id,
        $network: network.id,
        $topic: network.topic
      })
    )
    mediaStreamState.screenVideoProducer.value.close()
    mediaStreamState.screenVideoProducer.set(null)
  }

  if (mediaStreamState.screenAudioProducer.value) {
    dispatchAction(
      MediasoupMediaProducerActions.producerPaused({
        producerID: mediaStreamState.screenAudioProducer.value.id,
        globalMute: false,
        paused: true,
        $network: network.id,
        $topic: network.topic
      })
    )
    dispatchAction(
      MediasoupMediaProducerActions.producerClosed({
        producerID: mediaStreamState.screenAudioProducer.value.id,
        $network: network.id,
        $topic: network.topic
      })
    )
    mediaStreamState.screenAudioProducer.value.close()
    mediaStreamState.screenAudioProducer.set(null)
    mediaStreamState.screenShareAudioPaused.set(true)
  }
}

type Primus = EventEmitter & {
  buffer: any[]
  disconnect: boolean
  emitter: any //EventEmitter
  offlineHandler: () => void
  online: boolean
  onlineHandler: () => void
  options: {
    pingTimeout: 45000
    queueSize: number
    reconnect: any
    strategy: string
    timeout: number
    transport: any
  }
  readable: boolean
  readyState: number
  recovery: any
  socket: WebSocket
  timers: any
  transformers: { outgoing: Array<any>; incoming: Array<any> }
  transport: any
  url: URL
  writable: boolean
  _events: any
  _eventsCount: number

  AVOID_WEBSOCKETS: false
  NETWORK_EVENTS: unknown
  ark: any
  authorization: false
  client: unknown
  clone: unknown
  critical: unknown
  decoder: unknown
  destroy: () => void
  emits: unknown
  encoder: unknown
  end: () => void
  heartbeat: unknown
  id: unknown
  initialise: unknown
  merge: unknown
  open: unknown
  parse: unknown
  pathname: '/primus'
  plugin: unknown
  protocol: unknown
  querystring: unknown
  querystringify: unknown
  reserved: unknown
  send: unknown
  timeout: unknown
  transform: unknown
  transforms: unknown
  uri: unknown
  version: '7.3.4'
  write: (data: any) => void
  _write: unknown
}

// export type WebRTCTransportExtension
// export type ProducerExtension
// export type ConsumerExtension
// export const closeNetwork
// export const initializeNetwork
// export type SocketWebRTCClientNetwork
// export const connectToInstance
// export const getChannelIdFromTransport
// export async function checkInstanceserverReady
// export async function authenticatePrimus
// export const connectToNetwork
// export const waitForTransports
// export const onTransportCreated
// export async function createCamVideoProducer
// export async function createCamAudioProducer
// export const receiveConsumerHandler
// export const toggleMicrophonePaused
// export const toggleWebcamPaused
// export const toggleScreenshare
// export const toggleScreenshareAudioPaused
// export const toggleScreenshareVideoPaused
// export function leaveNetwork
// export const startScreenshare
// export const stopScreenshare
