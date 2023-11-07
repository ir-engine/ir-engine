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
import type { EventEmitter } from 'primus'
import Primus from 'primus-client'

import config from '@etherealengine/common/src/config'
import { DataChannelType } from '@etherealengine/common/src/interfaces/DataChannelType'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { getSearchParamFromURL } from '@etherealengine/common/src/utils/getSearchParamFromURL'
import multiLogger from '@etherealengine/engine/src/common/functions/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import {
  MediaStreamAppData,
  MediaTagType,
  NetworkState,
  addNetwork,
  removeNetwork,
  screenshareAudioDataChannelType,
  screenshareVideoDataChannelType,
  webcamAudioDataChannelType,
  webcamVideoDataChannelType
} from '@etherealengine/engine/src/networking/NetworkState'
import { NetworkTopics, createNetwork } from '@etherealengine/engine/src/networking/classes/Network'
import { PUBLIC_STUN_SERVERS } from '@etherealengine/engine/src/networking/constants/STUNServers'
import {
  CAM_VIDEO_SIMULCAST_CODEC_OPTIONS,
  CAM_VIDEO_SIMULCAST_ENCODINGS,
  SCREEN_SHARE_SIMULCAST_ENCODINGS
} from '@etherealengine/engine/src/networking/constants/VideoConstants'
import { NetworkPeerFunctions } from '@etherealengine/engine/src/networking/functions/NetworkPeerFunctions'
import { AuthTask } from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import {
  MediasoupDataProducerActions,
  MediasoupDataProducerConsumerState
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
import { InstanceID } from '@etherealengine/engine/src/schemas/networking/instance.schema'
import { ChannelID } from '@etherealengine/engine/src/schemas/social/channel.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { State, dispatchAction, getMutableState, getState, none } from '@etherealengine/hyperflux'
import {
  Action,
  Topic,
  defineActionQueue,
  removeActionQueue
} from '@etherealengine/hyperflux/functions/ActionFunctions'
import { MathUtils } from 'three'
import { LocationInstanceState } from '../common/services/LocationInstanceConnectionService'
import { MediaInstanceState } from '../common/services/MediaInstanceConnectionService'
import {
  startFaceTracking,
  startLipsyncTracking,
  stopFaceTracking,
  stopLipsyncTracking
} from '../media/webcam/WebcamInput'
import { AuthState } from '../user/services/AuthService'
import { MediaStreamState, MediaStreamService as _MediaStreamService } from './MediaStreams'
import { clearPeerMediaChannels } from './PeerMediaChannelState'

import { NetworkActionFunctions } from '@etherealengine/engine/src/networking/functions/NetworkActionFunctions'
import { DataChannelRegistryState } from '@etherealengine/engine/src/networking/systems/DataChannelRegistry'
import { encode } from 'msgpackr'

import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { defineSystem, disableSystem, startSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { LocationID, RoomCode } from '@etherealengine/engine/src/schemas/social/location.schema'
import { MessageID } from '@etherealengine/engine/src/schemas/social/message.schema'

const logger = multiLogger.child({ component: 'client-core:SocketWebRTCClientFunctions' })

export type WebRTCTransportExtension = Omit<MediaSoupTransport, 'appData'> & { appData: MediaStreamAppData }
export type ProducerExtension = Omit<Producer, 'appData'> & { appData: MediaStreamAppData }
export type ConsumerExtension = Omit<Consumer, 'appData'> & {
  appData: MediaStreamAppData
}

let id = 0

// import { encode, decode } from 'msgpackr'

// Adds support for Promise to Primus client
// Each 'data' listener function needs to be named something unique in order for removeListener to
// not remove all 'data' listener functions
export const promisedRequest = (network: SocketWebRTCClientNetwork, type: any, data = {}) => {
  return new Promise<any>((resolve) => {
    const responseFunction = (data) => {
      if (data.type.toString() === message.type.toString() && message.id === data.id) {
        resolve(data.data)
        network.transport.primus.removeListener('data', responseFunction)
      }
    }
    Object.defineProperty(responseFunction, 'name', { value: `responseFunction${id}`, writable: true })
    const message = {
      type: type,
      data: data,
      id: (id++).toString() as MessageID
    }
    network.transport.primus.write(message)

    network.transport.primus.on('data', responseFunction)
  })
}

const handleFailedConnection = (topic: Topic, instanceID: InstanceID) => {
  console.log('handleFailedConnection', topic, instanceID)
  if (topic === NetworkTopics.world) {
    const locationInstanceConnectionState = getMutableState(LocationInstanceState)
    locationInstanceConnectionState.instances[instanceID].set(none)
  } else {
    const mediaInstanceConnectionState = getMutableState(MediaInstanceState)
    mediaInstanceConnectionState.instances[instanceID].set(none)
  }
}

export const closeNetwork = (network: SocketWebRTCClientNetwork) => {
  const networkState = getMutableState(NetworkState).networks[network.id] as State<SocketWebRTCClientNetwork>
  networkState.connected.set(false)
  networkState.authenticated.set(false)
  networkState.ready.set(false)
  const transportState = getState(MediasoupTransportState)[network.id]
  if (transportState) {
    for (const { transportID } of Object.values(transportState)) {
      const transport = getState(MediasoupTransportObjectsState)[transportID]
      transport.close()
    }
  }
  network.transport.heartbeat && clearInterval(network.transport.heartbeat)
  network.transport.primus?.end()
  network.transport.primus?.removeAllListeners()
  networkState.transport.primus.set(null!)
}

export const initializeNetwork = (id: InstanceID, hostId: UserID, topic: Topic) => {
  const mediasoupDevice = new mediasoupClient.Device(
    getMutableState(EngineState).isBot.value ? { handlerName: 'Chrome74' } : undefined
  )

  const transport = {
    messageToPeer: (peerId: PeerID, data: any) => {
      network.transport.primus?.write(data)
    },

    messageToAll: (data: any) => {
      network.transport.primus?.write(data)
    },

    onMessage: (fromPeerID: PeerID, message: any) => {
      const actions = message as any as Required<Action>[]
      // const actions = decode(new Uint8Array(message)) as IncomingActionType[]
      NetworkActionFunctions.receiveIncomingActions(network, fromPeerID, actions)
    },

    bufferToPeer: (dataChannelType: DataChannelType, fromPeerID: PeerID, peerID: PeerID, data: any) => {
      transport.bufferToAll(dataChannelType, fromPeerID, data)
    },

    bufferToAll: (dataChannelType: DataChannelType, fromPeerID: PeerID, data: any) => {
      const dataProducer = MediasoupDataProducerConsumerState.getProducerByDataChannel(network.id, dataChannelType) as
        | DataProducer
        | undefined
      if (!dataProducer) return
      if (dataProducer.closed || dataProducer.readyState !== 'open') return
      const fromPeerIndex = network.peerIDToPeerIndex[fromPeerID]
      if (typeof fromPeerIndex === 'undefined')
        return console.warn('fromPeerIndex is undefined', fromPeerID, fromPeerIndex)
      dataProducer.send(encode([fromPeerIndex, data]))
    },

    onBuffer: (dataChannelType: DataChannelType, fromPeerID: PeerID, data: any) => {
      const dataChannelFunctions = getState(DataChannelRegistryState)[dataChannelType]
      if (dataChannelFunctions) {
        for (const func of dataChannelFunctions) func(network, dataChannelType, fromPeerID, data)
      }
    },

    mediasoupDevice,
    mediasoupLoaded: false,
    primus: null! as Primus,

    heartbeat: null! as NodeJS.Timer // is there an equivalent browser type for this?
  }

  const network = createNetwork(id, hostId, topic, transport)

  return network
}

export type SocketWebRTCClientNetwork = ReturnType<typeof initializeNetwork>

export const connectToNetwork = async (
  instanceID: InstanceID,
  ipAddress: string,
  port: string,
  locationId?: LocationID | null,
  channelId?: ChannelID | null,
  roomCode?: RoomCode | null
) => {
  logger.info('Connecting to instance type: %o', { instanceID, ipAddress, port, locationId, channelId, roomCode })

  const authState = getState(AuthState)
  const token = authState.authUser.accessToken

  const query = {
    instanceID,
    locationId,
    channelId,
    roomCode,
    token
  } as {
    instanceID: InstanceID
    locationId?: LocationID
    channelId?: ChannelID
    roomCode?: RoomCode
    address?: string
    port?: string
    token: string
  }

  if (locationId) delete query.channelId
  if (channelId) delete query.locationId
  if (!roomCode) delete query.roomCode

  let primus: Primus

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
    logger.error(err)
    return handleFailedConnection(locationId ? NetworkTopics.world : NetworkTopics.media, instanceID)
  }

  const connectionFailTimeout = setTimeout(() => {
    primus.off('incoming::open', onConnect)
    primus.removeAllListeners()
    primus.end()
    handleFailedConnection(locationId ? NetworkTopics.world : NetworkTopics.media, instanceID)
  }, 3000)

  const onConnect = () => {
    const topic = locationId ? NetworkTopics.world : NetworkTopics.media
    getMutableState(NetworkState).hostIds[topic].set(instanceID)
    const network = initializeNetwork(instanceID, instanceID as any, topic)
    addNetwork(network)

    const networkState = getMutableState(NetworkState).networks[network.id] as State<SocketWebRTCClientNetwork>

    networkState.transport.primus.set(primus)

    primus.off('incoming::open', onConnect)
    logger.info('CONNECTED to port %o', { port })

    clearTimeout(connectionFailTimeout)

    networkState.connected.set(true)
    authenticateNetwork(network)

    const onDisconnect = () => {
      logger.info('Disonnected from network %o', { topic: network.topic, id: network.id })
      leaveNetwork(network)
    }
    primus.on('incoming::end', onDisconnect)
  }
  primus.on('incoming::open', onConnect)

  logger.info('Connecting to instance type: %o', { instanceID, ipAddress, port, channelId, roomCode })
}

export const getChannelIdFromTransport = (network: SocketWebRTCClientNetwork) => {
  const channelConnectionState = getState(MediaInstanceState)
  const mediaNetwork = NetworkState.mediaNetwork
  const currentChannelInstanceConnection = mediaNetwork && channelConnectionState.instances[mediaNetwork.id]
  const isWorldConnection = network.topic === NetworkTopics.world
  return isWorldConnection ? null : currentChannelInstanceConnection?.channelId
}

export async function authenticateNetwork(network: SocketWebRTCClientNetwork) {
  if (network.authenticated) return

  logger.info('Authenticating instance: %o', { topic: network.topic, id: network.id })

  const networkState = getMutableState(NetworkState).networks[network.id] as State<SocketWebRTCClientNetwork>

  const authState = getState(AuthState)
  const accessToken = authState.authUser.accessToken
  const inviteCode = getSearchParamFromURL('inviteCode')
  const payload = { accessToken, peerID: Engine.instance.peerID, inviteCode }

  const { status, routerRtpCapabilities, cachedActions } = await new Promise<AuthTask>((resolve) => {
    const onAuthentication = (response: AuthTask) => {
      if (response.status !== 'pending') {
        clearInterval(interval)
        resolve(response)
        network.transport.primus.off('data', onAuthentication)
      }
    }

    network.transport.primus.on('data', onAuthentication)

    const interval = setInterval(() => {
      // ensure we're still connected
      if (!network.transport.primus) {
        clearInterval(interval)
        resolve({ status: 'fail' })
        return
      }

      network.transport.primus.write(payload)
    }, 100)
  })

  if (status !== 'success') {
    logger.error(status)
    return logger.error(new Error('Unable to connect with credentials'))
  }

  networkState.authenticated.set(true)

  // must be in an interval so that it runs outside of the animation frame loop
  network.transport.heartbeat = setInterval(() => {
    network.transport.messageToPeer(network.hostPeerID, [])
  }, 1000)

  network.transport.primus.on('data', (message) => {
    if (!message) return
    network.transport.onMessage(network.hostPeerID, message)
  })

  // handle cached actions
  for (const action of cachedActions!) Engine.instance.store.actions.incoming.push({ ...action, $fromCache: true })

  Engine.instance.store.actions.outgoing[network.topic].queue.push(
    ...Engine.instance.store.actions.outgoing[network.topic].history
  )

  const isWorldConnection = network.topic === NetworkTopics.world

  if (isWorldConnection) {
    const spectateUserId = getSearchParamFromURL('spectate')
    if (spectateUserId) {
      dispatchAction(EngineActions.spectateUser({ user: spectateUserId }))
    }

    // todo move to a reactor
    getMutableState(EngineState).connectedWorld.set(true)
  }

  ;(network.transport.mediasoupDevice.loaded
    ? Promise.resolve()
    : network.transport.mediasoupDevice.load({
        routerRtpCapabilities
      })
  ).then(() => {
    networkState.transport.mediasoupLoaded.set(true)
    dispatchAction(
      MediasoupTransportActions.requestTransport({
        peerID: Engine.instance.peerID,
        direction: 'send',
        sctpCapabilities: network.transport.mediasoupDevice.sctpCapabilities,
        $network: network.id,
        $topic: network.topic,
        $to: network.hostPeerID
      })
    )

    dispatchAction(
      MediasoupTransportActions.requestTransport({
        peerID: Engine.instance.peerID,
        direction: 'recv',
        sctpCapabilities: network.transport.mediasoupDevice.sctpCapabilities,
        $network: network.id,
        $topic: network.topic,
        $to: network.hostPeerID
      })
    )

    logger.info('Successfully loaded routerRtpCapabilities')
  })

  logger.info('Successfully connected to instance type: %o', { topic: network.topic, id: network.id })
}

export const waitForTransports = async (network: SocketWebRTCClientNetwork) => {
  const promise = new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (network.ready) {
        clearInterval(interval)
        resolve()
        return
      }
    }, 100)
  })
  return promise
}

export const onTransportCreated = async (action: typeof MediasoupTransportActions.transportCreated.matches._TYPE) => {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCClientNetwork

  const { transportID, direction, sctpParameters, iceParameters, iceCandidates, dtlsParameters } = action

  const channelId = getChannelIdFromTransport(network)

  let transport: MediaSoupTransport

  const iceServers = config.client.nodeEnv === 'production' ? PUBLIC_STUN_SERVERS : []

  const transportOptions = {
    id: action.transportID,
    sctpParameters: sctpParameters as any,
    iceParameters: iceParameters as any,
    iceCandidates: iceCandidates as any,
    dtlsParameters: dtlsParameters as any,
    iceServers
  }

  if (direction === 'recv') {
    transport = await network.transport.mediasoupDevice.createRecvTransport(transportOptions)
  } else if (direction === 'send') {
    transport = await network.transport.mediasoupDevice.createSendTransport(transportOptions)
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
      const requestID = MathUtils.generateUUID()
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
            disableSystem(systemUUID)
            removeActionQueue(actionQueue)
            removeActionQueue(errorQueue)
          }

          const systemUUID = defineSystem({
            uuid: 'action-receptor-' + requestID,
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
          startSystem(systemUUID, { after: PresentationSystemGroup })
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
            paused = mediaStreamState.videoPaused.value
            break
          case webcamAudioDataChannelType:
            paused = mediaStreamState.audioPaused.value
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
        const requestID = MathUtils.generateUUID()
        dispatchAction(
          MediaProducerActions.requestProducer({
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
            const actionQueue = defineActionQueue(MediaProducerActions.producerCreated.matches)
            const errorQueue = defineActionQueue(MediaProducerActions.requestProducerError.matches)

            const cleanup = () => {
              disableSystem(systemUUID)
              removeActionQueue(actionQueue)
              removeActionQueue(errorQueue)
            }

            const systemUUID = defineSystem({
              uuid: 'action-receptor-' + requestID,
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
            startSystem(systemUUID, { after: PresentationSystemGroup })
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
        if (label === '__CONNECT__') return callback({ id: '__CONNECT__' })

        const requestID = MathUtils.generateUUID()
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
              disableSystem(systemUUID)
              removeActionQueue(actionQueue)
              removeActionQueue(errorQueue)
            }

            const systemUUID = defineSystem({
              uuid: 'action-receptor-' + requestID,
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
            startSystem(systemUUID, { after: PresentationSystemGroup })
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
      logger.error('Transport %o transitioned to state ' + state, transport)
      logger.error(
        'If this occurred unexpectedly shortly after joining a world, check that the instanceserver nodegroup has public IP addresses.'
      )
      logger.info('Waiting 5 seconds to make a new transport')
      setTimeout(() => {
        logger.info('Re-creating transport after unexpected closing/fail/disconnect %o', {
          direction,
          channelId
        })
        // ensure the network still exists and we want to re-create the transport
        if (
          !getState(NetworkState).networks[network.id] ||
          !network.transport.primus ||
          network.transport.primus.disconnect
        )
          return

        dispatchAction(
          MediasoupTransportActions.requestTransport({
            peerID: Engine.instance.peerID,
            direction,
            sctpCapabilities: network.transport.mediasoupDevice.sctpCapabilities,
            $network: network.id,
            $topic: network.topic,
            $to: network.hostPeerID
          })
        )
      }, 5000)
    }
  })

  /**
   * Since mediasoup only connects the transport upon a consumer or producer being created,
   * we need to create a dummy consumer/producer to trigger the transport to connect.
   */
  try {
    if (direction === 'recv') {
      const consumer = await transport.consumeData({
        id: '',
        dataProducerId: '',
        sctpStreamParameters: {
          streamId: 1000000,
          ordered: true,
          maxPacketLifeTime: 0
        },
        label: '__CONNECT__'
      })
      consumer.close()
    } else {
      const producer = await transport.produceData({
        label: '__CONNECT__'
      })
      producer.close()
    }
  } catch (e) {
    // no-op
  }

  // /**
  //  * Since mediasoup only connects the transport upon a consumer or producer being created,
  //  * we need to manually dive in and call it's internal implementation.
  //  * - NOTE this does not work for Edge11
  // */
  // const handler = (transport as any)._handler
  // const offer = await handler._pc.createOffer()
  // const localSdpObject = sdpTransform.parse(offer.sdp)
  // const _dtlsParameters = sdpCommonUtils.extractDtlsParameters({ sdpObject: localSdpObject })
  // _dtlsParameters.role = handler._forcedLocalDtlsRole
  // handler._remoteSdp!.updateDtlsRole(handler._forcedLocalDtlsRole === 'client' ? 'server' : 'client')
  // await new Promise<void>((resolve, reject) => {
  //   transport.safeEmit('connect', { dtlsParameters: _dtlsParameters }, resolve, reject)
  // })
  // handler._transportReady = true

  getMutableState(MediasoupTransportObjectsState)[transportID].set(transport)
}

export async function configureMediaTransports(mediaTypes: string[]): Promise<boolean> {
  const mediaStreamState = getMutableState(MediaStreamState)
  if (
    mediaTypes.indexOf('video') > -1 &&
    (!mediaStreamState.videoStream.value || !mediaStreamState.videoStream.value.active)
  ) {
    await _MediaStreamService.startCamera()

    if (!mediaStreamState.videoStream.value) {
      logger.warn('Video stream is null, camera must have failed or be missing')
      return false
    }
  }

  if (
    mediaTypes.indexOf('audio') > -1 &&
    (!mediaStreamState.audioStream.value || !mediaStreamState.audioStream.value.active)
  ) {
    await _MediaStreamService.startMic()

    if (!mediaStreamState.audioStream.value) {
      logger.warn('Audio stream is null, mic must have failed or be missing')
      return false
    }
  }
  return true
}

export async function createCamVideoProducer(network: SocketWebRTCClientNetwork): Promise<void> {
  const channelConnectionState = getState(MediaInstanceState)
  const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
  const channelId = currentChannelInstanceConnection.channelId
  const mediaStreamState = getMutableState(MediaStreamState)
  if (mediaStreamState.videoStream.value !== null) {
    await waitForTransports(network)
    const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

    try {
      let produceInProgress = false
      await new Promise((resolve) => {
        const waitForProducer = setInterval(async () => {
          if (!mediaStreamState.camVideoProducer.value || mediaStreamState.camVideoProducer.value.closed) {
            if (!produceInProgress) {
              produceInProgress = true
              const producer = (await transport.produce({
                track: mediaStreamState.videoStream.value!.getVideoTracks()[0],
                encodings: CAM_VIDEO_SIMULCAST_ENCODINGS,
                codecOptions: CAM_VIDEO_SIMULCAST_CODEC_OPTIONS,
                appData: { mediaTag: webcamVideoDataChannelType, channelId: channelId }
              })) as any as ProducerExtension
              getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[producer.id].set(producer)
              mediaStreamState.camVideoProducer.set(producer)
            }
          } else {
            clearInterval(waitForProducer)
            produceInProgress = false
            resolve(true)
          }
        }, 100)
      })
    } catch (err) {
      logger.error(err, 'Error producing video')
    }
  }
}

export async function createCamAudioProducer(network: SocketWebRTCClientNetwork): Promise<void> {
  const channelConnectionState = getState(MediaInstanceState)
  const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
  const channelId = currentChannelInstanceConnection.channelId
  const mediaStreamState = getMutableState(MediaStreamState)
  if (mediaStreamState.audioStream.value !== null) {
    //To control the producer audio volume, we need to clone the audio track and connect a Gain to it.
    //This Gain is saved on MediaStreamState so it can be accessed from the user's component and controlled.
    const audioTrack = mediaStreamState.audioStream.value.getAudioTracks()[0]
    const ctx = new AudioContext()
    const src = ctx.createMediaStreamSource(new MediaStream([audioTrack]))
    const dst = ctx.createMediaStreamDestination()
    const gainNode = ctx.createGain()
    gainNode.gain.value = 1
    ;[src, gainNode, dst].reduce((a, b) => a && (a.connect(b) as any))
    mediaStreamState.microphoneGainNode.set(gainNode)
    mediaStreamState.audioStream.value.removeTrack(audioTrack)
    mediaStreamState.audioStream.value.addTrack(dst.stream.getAudioTracks()[0])
    // same thing for audio, but we can use our already-created

    await waitForTransports(network)
    const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

    try {
      // Create a new transport for audio and start producing
      let produceInProgress = false
      await new Promise((resolve) => {
        const waitForProducer = setInterval(async () => {
          if (!mediaStreamState.camAudioProducer.value || mediaStreamState.camAudioProducer.value.closed) {
            if (!produceInProgress) {
              produceInProgress = true
              const producer = (await transport.produce({
                track: mediaStreamState.audioStream.value!.getAudioTracks()[0],
                appData: { mediaTag: webcamAudioDataChannelType, channelId: channelId }
              })) as any as ProducerExtension
              getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[producer.id].set(producer)
              mediaStreamState.camAudioProducer.set(producer)
            }
          } else {
            clearInterval(waitForProducer)
            produceInProgress = false
            resolve(true)
          }
        }, 100)
      })
    } catch (err) {
      logger.error(err, 'Error producing video')
    }
  }
}

/** @todo this is unused, see if it's ever needed to add these checks */
export async function subscribeToTrack(
  network: SocketWebRTCClientNetwork,
  peerID: PeerID,
  mediaTag: MediaTagType,
  producerId: string,
  channelId: ChannelID
) {
  const primus = network.transport.primus
  if (primus?.disconnect) return

  const mediaStreamState = getState(MediaStreamState)

  const selfProducerIds = [mediaStreamState.camVideoProducer?.id, mediaStreamState.camAudioProducer?.id]
  const channelConnectionState = getState(MediaInstanceState)
  const currentChannelInstanceConnection = channelConnectionState.instances[network.id]

  const existingConsumer = MediasoupMediaProducerConsumerState.getConsumerByPeerIdAndMediaTag(
    network.id,
    peerID,
    mediaTag
  ) as ConsumerExtension
  const consumerMatch = !!existingConsumer && existingConsumer?.id === producerId

  if (
    !producerId ||
    selfProducerIds.includes(producerId) ||
    //The commented portion below was causing re-creation of consumers when the existing one was merely unable
    //to provide data for a short time. If it's necessary for some logic to work, then it should be rewritten
    //to do something like record when it started being muted, and only run if it's been muted for a while.
    consumerMatch /*|| !(consumerMatch.track?.muted && consumerMatch.track?.enabled)*/ ||
    currentChannelInstanceConnection.channelId !== channelId
  ) {
    return //console.error('Invalid consumer', producerId, selfProducerIds, consumerMatch, currentChannelInstanceConnection.channelId === channelId)
  }

  // ask the server to create a server-side consumer object and send us back the info we need to create a client-side consumer
  dispatchAction(
    MediasoupMediaConsumerActions.requestConsumer({
      mediaTag,
      peerID,
      rtpCapabilities: network.transport.mediasoupDevice.rtpCapabilities,
      channelID: channelId,
      $network: network.id,
      $topic: network.topic,
      $to: network.hostPeerID
    })
  )
}

export const receiveConsumerHandler = async (
  action: typeof MediasoupMediaConsumerActions.consumerCreated.matches._TYPE
) => {
  const network = getState(NetworkState).networks[action.$network] as SocketWebRTCClientNetwork

  const { peerID, mediaTag, channelID, paused } = action

  await waitForTransports(network)
  const transport = MediasoupTransportState.getTransport(network.id, 'recv') as WebRTCTransportExtension

  const consumer = (await transport.consume({
    id: action.consumerID,
    producerId: action.producerID,
    rtpParameters: action.rtpParameters as any,
    kind: action.kind!,
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
    if (!paused) resumeConsumer(network, consumer)
    else pauseConsumer(network, consumer)
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
      resumeConsumer(network, consumer)
    } else {
      pauseConsumer(network, consumer)
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

export function pauseConsumer(network: SocketWebRTCClientNetwork, consumer: ConsumerExtension) {
  dispatchAction(
    MediasoupMediaConsumerActions.consumerPaused({
      consumerID: consumer.id,
      paused: true,
      $network: network.id,
      $topic: network.topic,
      $to: network.hostPeerID
    })
  )
}

export function resumeConsumer(network: SocketWebRTCClientNetwork, consumer: ConsumerExtension) {
  dispatchAction(
    MediasoupMediaConsumerActions.consumerPaused({
      consumerID: consumer.id,
      paused: false,
      $network: network.id,
      $topic: network.topic,
      $to: network.hostPeerID
    })
  )
}

export function pauseProducer(network: SocketWebRTCClientNetwork, producer: ProducerExtension) {
  dispatchAction(
    MediaProducerActions.producerPaused({
      producerID: producer.id,
      globalMute: false,
      paused: true,
      $network: network.id,
      $topic: network.topic
    })
  )
}

export function resumeProducer(network: SocketWebRTCClientNetwork, producer: ProducerExtension) {
  dispatchAction(
    MediaProducerActions.producerPaused({
      producerID: producer.id,
      globalMute: false,
      paused: false,
      $network: network.id,
      $topic: network.topic
    })
  )
}

export function globalMuteProducer(network: SocketWebRTCClientNetwork, producer: { id: any }) {
  dispatchAction(
    MediaProducerActions.producerPaused({
      producerID: producer.id,
      globalMute: true,
      paused: true,
      $network: network.id,
      $topic: network.topic
    })
  )
}

export function globalUnmuteProducer(network: SocketWebRTCClientNetwork, producer: { id: any }) {
  dispatchAction(
    MediaProducerActions.producerPaused({
      producerID: producer.id,
      globalMute: false,
      paused: false,
      $network: network.id,
      $topic: network.topic
    })
  )
}

export function setPreferredConsumerLayer(
  network: SocketWebRTCClientNetwork,
  consumer: ConsumerExtension,
  layer: number
) {
  dispatchAction(
    MediasoupMediaConsumerActions.consumerLayers({
      consumerID: consumer.id,
      layer,
      $network: network.id,
      $topic: network.topic,
      $to: network.hostPeerID
    })
  )
}

export const toggleFaceTracking = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  if (mediaStreamState.faceTracking.value) {
    mediaStreamState.faceTracking.set(false)
    stopFaceTracking()
    stopLipsyncTracking()
  } else {
    const mediaNetwork = NetworkState.mediaNetwork as SocketWebRTCClientNetwork
    if (await configureMediaTransports(['video', 'audio'])) {
      mediaStreamState.faceTracking.set(true)
      startFaceTracking()
      startLipsyncTracking()
    }
  }
}

export const toggleMicrophonePaused = async () => {
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = NetworkState.mediaNetwork as SocketWebRTCClientNetwork
  if (await configureMediaTransports(['audio'])) {
    if (!mediaStreamState.camAudioProducer.value) await createCamAudioProducer(mediaNetwork)
    else {
      const audioPaused = mediaStreamState.audioPaused.value
      if (audioPaused) resumeProducer(mediaNetwork, mediaStreamState.camAudioProducer.value!)
      else pauseProducer(mediaNetwork, mediaStreamState.camAudioProducer.value!)
      mediaStreamState.audioPaused.set(!audioPaused)
    }
  }
}

export const toggleWebcamPaused = async () => {
  console.log('toggleWebcamPaused')
  const mediaStreamState = getMutableState(MediaStreamState)
  const mediaNetwork = NetworkState.mediaNetwork as SocketWebRTCClientNetwork
  if (await configureMediaTransports(['video'])) {
    if (!mediaStreamState.camVideoProducer.value) await createCamVideoProducer(mediaNetwork)
    else {
      const videoPaused = mediaStreamState.videoPaused.value
      console.log({ videoPaused })
      if (videoPaused) resumeProducer(mediaNetwork, mediaStreamState.camVideoProducer.value!)
      else pauseProducer(mediaNetwork, mediaStreamState.camVideoProducer.value!)
      mediaStreamState.videoPaused.set(!videoPaused)
    }
  }
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
  if (audioPaused) resumeProducer(mediaNetwork, mediaStreamState.screenAudioProducer.value!)
  else pauseProducer(mediaNetwork, mediaStreamState.screenAudioProducer.value!)
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
  try {
    if (!network) return
    closeNetwork(network)

    NetworkPeerFunctions.destroyAllPeers(network)
    removeNetwork(network)

    if (network.topic === NetworkTopics.media) {
      clearPeerMediaChannels()
      getMutableState(NetworkState).hostIds.media.set(none)
      getMutableState(MediaInstanceState).instances[network.id].set(none)
    } else {
      getMutableState(NetworkState).hostIds.world.set(none)
      getMutableState(LocationInstanceState).instances[network.id].set(none)
      // if world has a media server connection
      if (NetworkState.mediaNetwork) {
        leaveNetwork(NetworkState.mediaNetwork as SocketWebRTCClientNetwork)
      }
      const parsed = new URL(window.location.href)
      const query = parsed.searchParams
      query.delete('roomCode')
      query.delete('instanceId')
      parsed.search = query.toString()
      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
    }
  } catch (err) {
    logger.error(err, 'Error with leave()')
  }
}

export const startScreenshare = async (network: SocketWebRTCClientNetwork) => {
  logger.info('Start screen share')
  const mediaStreamState = getMutableState(MediaStreamState)

  // get a screen share track
  mediaStreamState.localScreen.set(
    await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })
  )

  const channelConnectionState = getState(MediaInstanceState)
  const currentChannelInstanceConnection = channelConnectionState.instances[network.id]
  const channelId = currentChannelInstanceConnection.channelId

  await waitForTransports(network)
  const transport = MediasoupTransportState.getTransport(network.id, 'send') as WebRTCTransportExtension

  // create a producer for video
  const videoProducer = (await transport.produce({
    track: mediaStreamState.localScreen.value!.getVideoTracks()[0],
    encodings: SCREEN_SHARE_SIMULCAST_ENCODINGS,
    codecOptions: CAM_VIDEO_SIMULCAST_CODEC_OPTIONS,
    appData: { mediaTag: screenshareVideoDataChannelType, channelId }
  })) as any as ProducerExtension
  mediaStreamState.screenVideoProducer.set(videoProducer)

  getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[videoProducer.id].set(videoProducer)

  // create a producer for audio, if we have it
  if (mediaStreamState.localScreen.value!.getAudioTracks().length) {
    const audioProducer = (await transport.produce({
      track: mediaStreamState.localScreen.value!.getAudioTracks()[0],
      appData: { mediaTag: screenshareAudioDataChannelType, channelId }
    })) as any as ProducerExtension
    mediaStreamState.screenAudioProducer.set(audioProducer)
    mediaStreamState.screenShareAudioPaused.set(false)
    getMutableState(MediasoupMediaProducersConsumersObjectsState).producers[audioProducer.id].set(audioProducer)
  }

  // handler for screen share stopped event (triggered by the
  // browser's built-in screen sharing ui)
  mediaStreamState.screenVideoProducer.value!.track!.onended = async () => {
    return stopScreenshare(network)
  }

  mediaStreamState.screenShareVideoPaused.set(false)
}

export const stopScreenshare = async (network: SocketWebRTCClientNetwork) => {
  logger.info('Screen share stopped')
  const mediaStreamState = getMutableState(MediaStreamState)

  console.log(mediaStreamState.screenVideoProducer.value, mediaStreamState.screenShareVideoPaused.value)
  if (mediaStreamState.screenVideoProducer.value) {
    await mediaStreamState.screenVideoProducer.value.pause()
    mediaStreamState.screenShareVideoPaused.set(true)
    dispatchAction(
      MediaProducerActions.producerClosed({
        producerID: mediaStreamState.screenVideoProducer.value.id,
        $network: network.id,
        $topic: network.topic
      })
    )
    await mediaStreamState.screenVideoProducer.value.close()
    mediaStreamState.screenVideoProducer.set(null)
  }

  if (mediaStreamState.screenAudioProducer.value) {
    dispatchAction(
      MediaProducerActions.producerClosed({
        producerID: mediaStreamState.screenAudioProducer.value.id,
        $network: network.id,
        $topic: network.topic
      })
    )
    await mediaStreamState.screenAudioProducer.value.close()
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
