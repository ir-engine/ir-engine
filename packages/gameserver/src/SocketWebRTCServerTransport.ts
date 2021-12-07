import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { handleNetworkStateUpdate } from '@xrengine/engine/src/networking/functions/updateNetworkState'
import { NetworkTransport } from '@xrengine/engine/src/networking/interfaces/NetworkTransport'
import config from '@xrengine/server-core/src/appconfig'
import { localConfig } from '@xrengine/server-core/src/config'
import logger from '@xrengine/server-core/src/logger'
import {
  cleanupOldGameservers,
  getFreeSubdomain,
  handleConnectToWorld,
  handleDisconnect,
  handleHeartbeat,
  handleIncomingActions,
  handleIncomingMessage,
  handleJoinWorld,
  handleLeaveWorld,
  validateNetworkObjects
} from './NetworkFunctions'
import { WebRtcTransportParams } from '@xrengine/server-core/src/types/WebRtcTransportParams'
import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'
import AWS from 'aws-sdk'
import * as https from 'https'
import { DataProducer, Router, Transport, Worker } from 'mediasoup/node/lib/types'
import SocketIO, { Socket } from 'socket.io'
import {
  handleWebRtcCloseConsumer,
  handleWebRtcCloseProducer,
  handleWebRtcConsumerSetLayers,
  handleWebRtcInitializeRouter,
  handleWebRtcPauseConsumer,
  handleWebRtcPauseProducer,
  handleWebRtcProduceData,
  handleWebRtcReceiveTrack,
  handleWebRtcRequestCurrentProducers,
  handleWebRtcRequestNearbyUsers,
  handleWebRtcResumeConsumer,
  handleWebRtcResumeProducer,
  handleWebRtcSendTrack,
  handleWebRtcTransportClose,
  handleWebRtcTransportConnect,
  handleWebRtcTransportCreate,
  startWebRTC
} from './WebRTCFunctions'
import { encode } from 'msgpackr'
import { Action } from '@xrengine/engine/src/networking/interfaces/Action'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Application } from '@xrengine/server-core/declarations'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'

const gsNameRegex = /gameserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/

function isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
  return typeof obj === 'undefined' || obj === null
}

export class SocketWebRTCServerTransport implements NetworkTransport {
  server: https.Server
  socketIO: SocketIO.Server
  workers: Worker[] = []
  routers: Record<string, Router>
  transport: Transport
  app: Application
  dataProducers: DataProducer[] = []
  outgoingDataTransport: Transport
  outgoingDataProducer: DataProducer
  gameServer

  constructor(app) {
    this.app = app
  }

  public sendActions = (actions: Set<Action>): any => {
    if (actions.size === 0 || this.socketIO == null) return
    const clients = useWorld().clients
    for (const [socketID, socket] of this.socketIO.of('/').sockets) {
      const arr: Action[] = []
      for (const action of actions) {
        if (!action.$to) continue
        if (action.$to === 'all' || socketID === clients.get(action.$to as UserId)?.socketId) {
          arr.push(action)
        }
      }
      if (arr.length) socket.emit(MessageTypes.ActionData.toString(), /*encode(*/ arr) //)
    }
  }

  public sendReliableData = (message: any): any => {
    if (this.socketIO != null) this.socketIO.of('/').emit(MessageTypes.ReliableMessage.toString(), message)
  }

  public sendNetworkStatUpdateMessage = (message: any): any => {
    if (this.socketIO != null) this.socketIO.of('/').emit(MessageTypes.UpdateNetworkState.toString(), message)
  }

  toBuffer(ab): any {
    var buf = Buffer.alloc(ab.byteLength)
    var view = new Uint8Array(ab)
    for (var i = 0; i < buf.length; ++i) {
      buf[i] = view[i]
    }
    return buf
  }

  public sendData = (data: any): void => {
    if (this.outgoingDataProducer != null) this.outgoingDataProducer.send(this.toBuffer(data))
  }

  public handleKick(socket: any): void {
    logger.info('Kicking ', socket.id)
    // TODO: Make sure this is right
    // logger.info(this.socketIO.allSockets()[socket.id]);
    if (this.socketIO != null) this.socketIO.of('/').emit(MessageTypes.Kick.toString(), socket.id)
  }

  close() {
    if (this.transport && typeof this.transport.close === 'function') this.transport.close()
  }

  public async initialize(): Promise<void> {
    // Set up realtime channel on socket.io
    this.socketIO = this.app.io

    this.socketIO.of('/').on('connect', async (socket: Socket) => {
      let listenersSetUp = false

      if (!Engine.sceneLoaded && this.app.isChannelInstance !== true) {
        await new Promise<void>((resolve) => {
          EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, resolve)
        })
      }

      // Authorize user and make sure everything is valid before allowing them to join the world
      socket.on(MessageTypes.Authorization.toString(), async (data, callback) => {
        console.log('AUTHORIZATION CALL HANDLER', data.userId)
        const userId = data.userId
        const accessToken = data.accessToken

        // userId or access token were undefined, so something is wrong. Return failure
        if (isNullOrUndefined(userId) || isNullOrUndefined(accessToken)) {
          const message = 'userId or accessToken is undefined'
          console.error(message)
          callback({ success: false, message })
          return
        }

        // Check database to verify that user ID is valid
        const user = await (this.app.service('user') as any).Model.findOne({
          attributes: ['id', 'name', 'instanceId', 'avatarId'],
          where: {
            id: userId
          }
        }).catch((error) => {
          // They weren't found in the dabase, so send the client an error message and return
          callback({ success: false, message: error })
          return console.warn('Failed to authorize user')
        })

        // Check database to verify that user ID is valid
        const avatarResources = await this.app
          .service('static-resource')
          .find({
            query: {
              $select: ['name', 'url', 'staticResourceType', 'userId'],
              $or: [{ userId: null }, { userId: user.id }],
              name: user.avatarId,
              staticResourceType: {
                $in: ['user-thumbnail', 'avatar']
              }
            }
          })
          .catch((error) => {
            // They weren't found in the database, so send the client an error message and return
            callback({ success: false, message: error })
            return console.warn('User avatar not found')
          })

        const avatar = {
          thumbnailURL: '',
          avatarURL: ''
        } as any
        avatarResources?.data.forEach((a) => {
          if (a.staticResourceType === 'avatar') avatar.avatarURL = a.url
          else avatar.thumbnailURL = a.url
        })

        // TODO: Check that they are supposed to be in this instance
        // TODO: Check that token is valid (to prevent users hacking with a manipulated user ID payload)

        // Return an authorization success message to client
        callback({ success: true })

        if (!listenersSetUp) {
          listenersSetUp = true
          socket.on(MessageTypes.ConnectToWorld.toString(), async (data, callback) => {
            // console.log('Got ConnectToWorld:');
            // console.log(data);
            // console.log(userId);
            // console.log("Avatar", avatar)
            handleConnectToWorld(socket, data, callback, userId, user, avatar)
          })

          socket.on(MessageTypes.JoinWorld.toString(), async (data, callback) =>
            handleJoinWorld(socket, data, callback, userId, user)
          )

          socket.on(MessageTypes.ActionData.toString(), (data) => handleIncomingActions(socket, data))

          // If a reliable message is received, add it to the queue
          socket.on(MessageTypes.ReliableMessage.toString(), (data) => handleIncomingMessage(socket, data))

          socket.on(MessageTypes.Heartbeat.toString(), () => handleHeartbeat(socket))

          socket.on('disconnect', () => handleDisconnect(socket))

          socket.on(MessageTypes.LeaveWorld.toString(), (data, callback) => handleLeaveWorld(socket, data, callback))

          socket.on(MessageTypes.WebRTCTransportCreate.toString(), async (data: WebRtcTransportParams, callback) =>
            handleWebRtcTransportCreate(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCProduceData.toString(), async (data, callback) =>
            handleWebRtcProduceData(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCTransportConnect.toString(), async (data, callback) =>
            handleWebRtcTransportConnect(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCTransportClose.toString(), async (data, callback) =>
            handleWebRtcTransportClose(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCCloseProducer.toString(), async (data, callback) =>
            handleWebRtcCloseProducer(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCSendTrack.toString(), async (data, callback) =>
            handleWebRtcSendTrack(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCReceiveTrack.toString(), async (data, callback) =>
            handleWebRtcReceiveTrack(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCPauseConsumer.toString(), async (data, callback) =>
            handleWebRtcPauseConsumer(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCResumeConsumer.toString(), async (data, callback) =>
            handleWebRtcResumeConsumer(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCCloseConsumer.toString(), async (data, callback) =>
            handleWebRtcCloseConsumer(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCConsumerSetLayers.toString(), async (data, callback) =>
            handleWebRtcConsumerSetLayers(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCResumeProducer.toString(), async (data, callback) =>
            handleWebRtcResumeProducer(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCPauseProducer.toString(), async (data, callback) =>
            handleWebRtcPauseProducer(socket, data, callback)
          )

          socket.on(MessageTypes.WebRTCRequestNearbyUsers.toString(), async (data, callback) =>
            handleWebRtcRequestNearbyUsers(socket, data, callback)
          )
          socket.on(MessageTypes.WebRTCRequestCurrentProducers.toString(), async (data, callback) =>
            handleWebRtcRequestCurrentProducers(socket, data, callback)
          )

          socket.on(MessageTypes.UpdateNetworkState.toString(), async (data) =>
            handleNetworkStateUpdate(socket, data, true)
          )

          socket.on(MessageTypes.InitializeRouter.toString(), async (data, callback) =>
            handleWebRtcInitializeRouter(socket, data, callback)
          )
        }
      })
    })

    const gameServerSetting = await this.app.service('game-server-setting').find()
    const [dbGameServerConfigData] = gameServerSetting.data

    const gameServerConfig = dbGameServerConfigData || config.gameserver

    const awsSetting = await this.app.service('aws-setting').find()
    const [dbAwsConfigData] = awsSetting.data

    const awsConfig = dbAwsConfigData || config.aws

    const Route53 = new AWS.Route53({ ...awsConfig.route53.keys })

    // Set up our gameserver according to our current environment
    const localIp = await getLocalServerIp()
    let stringSubdomainNumber, gsResult
    if (!config.kubernetes.enabled)
      try {
        await (this.app.service('instance') as any).Model.update(
          { ended: true, assigned: false, assignedAt: null },
          { where: {} }
        )
      } catch (error) {
        logger.warn(error)
      }
    else if (config.kubernetes.enabled) {
      await cleanupOldGameservers()
      this.gameServer = await this.app.agonesSDK.getGameServer()
      const name = this.gameServer.objectMeta.name
      this.app.gsName = name

      const gsIdentifier = gsNameRegex.exec(name)!
      stringSubdomainNumber = await getFreeSubdomain(this.app, gsIdentifier[1], 0)
      this.app.gsSubdomainNumber = stringSubdomainNumber

      gsResult = await this.app.agonesSDK.getGameServer()
      const params = {
        ChangeBatch: {
          Changes: [
            {
              Action: 'UPSERT',
              ResourceRecordSet: {
                Name: `${stringSubdomainNumber}.${gameServerConfig.domain}`,
                ResourceRecords: [{ Value: gsResult.status.address }],
                TTL: 0,
                Type: 'A'
              }
            }
          ]
        },
        HostedZoneId: awsConfig.route53.hostedZoneId
      }
      if (gameServerConfig.local !== true) await Route53.changeResourceRecordSets(params as any).promise()
    }

    localConfig.mediasoup.webRtcTransport.listenIps = [
      {
        ip: '0.0.0.0',
        announcedIp: config.kubernetes.enabled
          ? gameServerConfig.local === true
            ? gsResult.status.address
            : `${stringSubdomainNumber}.${gameServerConfig.domain}`
          : localIp.ipAddress
      }
    ]

    await startWebRTC()

    this.outgoingDataTransport = await this.routers.instance[0].createDirectTransport()
    const options = {
      ordered: false,
      label: 'outgoingProducer',
      protocol: 'raw',
      appData: { peerID: 'outgoingProducer' }
    }
    this.outgoingDataProducer = await this.outgoingDataTransport.produceData(options)

    const currentRouter = this.routers.instance[0]

    await Promise.all(
      (this.routers.instance as any).map(async (router) => {
        if (router.id !== currentRouter.id)
          return currentRouter.pipeToRouter({ dataProducerId: this.outgoingDataProducer.id, router: router })
        else return Promise.resolve()
      })
    )

    setInterval(() => validateNetworkObjects(), 5000)
    console.log('Server transport initialized')
  }
}
