import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { NetworkTransport } from '@xrengine/engine/src/networking/interfaces/NetworkTransport'
import config from '@xrengine/server-core/src/appconfig'
import { localConfig } from '@xrengine/server-core/src/config'
import logger from '@xrengine/server-core/src/logger'
import { cleanupOldGameservers, getFreeSubdomain, validateNetworkObjects } from './NetworkFunctions'
import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'
import AWS from 'aws-sdk'
import * as https from 'https'
import { DataProducer, Router, Transport, Worker } from 'mediasoup/node/lib/types'
import SocketIO from 'socket.io'
import { startWebRTC } from './WebRTCFunctions'
import { Action } from '@xrengine/engine/src/networking/interfaces/Action'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Application } from '@xrengine/server-core/declarations'
import { setupSocketFunctions } from './SocketFunctions'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

const gsNameRegex = /gameserver-([a-zA-Z0-9]{5}-[a-zA-Z0-9]{5})/

export const setupSubdomain = async (app: Application) => {
  let stringSubdomainNumber: string

  if (config.kubernetes.enabled) {
    await cleanupOldGameservers()
    app.gameServer = await app.agonesSDK.getGameServer()
    const name = app.gameServer.objectMeta.name

    const gsIdentifier = gsNameRegex.exec(name)!
    stringSubdomainNumber = await getFreeSubdomain(gsIdentifier[1], 0)
    app.gsSubdomainNumber = stringSubdomainNumber

    const Route53 = new AWS.Route53({ ...config.aws.route53.keys })
    const params = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: `${stringSubdomainNumber}.${config.gameserver.domain}`,
              ResourceRecords: [{ Value: app.gameServer.status.address }],
              TTL: 0,
              Type: 'A'
            }
          }
        ]
      },
      HostedZoneId: config.aws.route53.hostedZoneId
    }
    if (config.gameserver.local !== true) await Route53.changeResourceRecordSets(params as any).promise()
  } else {
    try {
      // is this needed?
      await (app.service('instance') as any).Model.update(
        { ended: true, assigned: false, assignedAt: null },
        { where: {} }
      )
    } catch (error) {
      logger.warn(error)
    }
  }

  // Set up our gameserver according to our current environment
  const localIp = await getLocalServerIp(app.isChannelInstance)
  const announcedIp = config.kubernetes.enabled
    ? config.gameserver.local === true
      ? app.gameServer.status.address
      : `${stringSubdomainNumber!}.${config.gameserver.domain}`
    : localIp.ipAddress

  localConfig.mediasoup.webRtcTransport.listenIps = [
    {
      ip: '0.0.0.0',
      announcedIp
    }
  ]
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

  constructor(app) {
    this.app = app
  }

  public sendActions = (actions: Set<Required<Action>>): any => {
    if (actions.size === 0 || this.socketIO == null) return
    const world = useWorld()
    const clients = world.clients
    const userIdMap = {} as { [socketId: string]: UserId }
    for (const [id, client] of clients) userIdMap[client.socketId!] = id

    for (const [socketID, socket] of this.socketIO.of('/').sockets) {
      const arr: Action[] = []
      for (const action of actions) {
        if (!action.$to) continue
        const toUserId = userIdMap[socketID]
        if (action.$to === 'all' || (action.$to === 'others' && toUserId !== action.$from) || action.$to === toUserId) {
          arr.push(action)
        }
      }
      if (arr.length) socket.emit(MessageTypes.ActionData.toString(), /*encode(*/ arr) //)
    }

    for (const action of actions) {
      if (
        action.$to === 'all' ||
        (action.$to === 'others' && action.$from != Engine.userId) ||
        action.$to === 'local' ||
        action.$to === Engine.userId
      )
        world.incomingActions.add(action)
    }
  }

  public sendReliableData = (message: any): any => {
    if (this.socketIO != null) this.socketIO.of('/').emit(MessageTypes.ReliableMessage.toString(), message)
  }

  public sendNetworkStatUpdateMessage = (message: any): any => {
    if (this.socketIO != null) this.socketIO.of('/').emit(MessageTypes.UpdateNetworkState.toString(), message)
  }

  // TODO: is this necessary?
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

  // TODO: this is not used anywhere
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
    this.socketIO.of('/').on('connect', setupSocketFunctions(this.app))

    await setupSubdomain(this.app)

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

    // TODO: move this to engine/ECS
    setInterval(() => validateNetworkObjects(), 5000)

    console.log('Server transport initialized')
  }
}
