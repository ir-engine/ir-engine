import * as https from 'https'
import { DataProducer, Router, Transport, Worker } from 'mediasoup/node/lib/types'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NetworkTransportHandler } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { NetworkTransport } from '@xrengine/engine/src/networking/interfaces/NetworkTransport'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'
import { Application } from '@xrengine/server-core/declarations'

import { setupSubdomain } from './NetworkFunctions'
import { setupSocketFunctions } from './SocketFunctions'
import { startWebRTC } from './WebRTCFunctions'

export class ServerTransportHandler
  implements NetworkTransportHandler<SocketWebRTCServerTransport, SocketWebRTCServerTransport>
{
  mediaTransports = new Map<UserId, SocketWebRTCServerTransport>()
  worldTransports = new Map<UserId, SocketWebRTCServerTransport>()
  getMediaTransport(transport?: UserId) {
    return this.mediaTransports.get('media' as UserId)!
  }
  getWorldTransport(transport?: UserId) {
    return this.worldTransports.get('server' as UserId)!
  }
}

export class SocketWebRTCServerTransport implements NetworkTransport {
  server: https.Server
  workers: Worker[] = []
  routers: Record<string, Router[]>
  transport: Transport
  app: Application
  dataProducers: DataProducer[] = []
  outgoingDataTransport: Transport
  outgoingDataProducer: DataProducer
  request = () => null!

  constructor(app) {
    this.app = app
  }

  public sendActions = (actions: Array<Required<Action<'WORLD'>>>): any => {
    if (actions.length === 0 || this.app.io == null) return
    const world = Engine.instance.currentWorld
    const clients = world.clients
    const userIdMap = {} as { [socketId: string]: UserId }
    for (const [id, client] of clients) userIdMap[client.socketId!] = id

    for (const [socketID, socket] of this.app.io.of('/').sockets) {
      const arr: Action<any>[] = []
      for (const action of [...actions]) {
        if (world.store.actions.outgoingHistoryUUIDs.has(action.$uuid)) {
          const idx = world.store.actions.outgoing.indexOf(action)
          world.store.actions.outgoing.splice(idx, 1)
        }
        if (!action.$to) continue
        const toUserId = userIdMap[socketID]
        if (action.$to === 'all' || (action.$to === 'others' && toUserId !== action.$from) || action.$to === toUserId) {
          arr.push(action)
        }
      }
      if (arr.length) socket.emit(MessageTypes.ActionData.toString(), /*encode(*/ arr) //)
    }
  }

  public sendReliableData = (message: any): any => {
    if (this.app.io != null) this.app.io.of('/').emit(MessageTypes.ReliableMessage.toString(), message)
  }

  public sendData = (data: Buffer): void => {
    if (this.outgoingDataProducer != null) this.outgoingDataProducer.send(Buffer.from(new Uint8Array(data)))
  }

  close() {
    if (this.transport && typeof this.transport.close === 'function') this.transport.close()
  }

  public async initialize(): Promise<void> {
    // Set up realtime channel on socket.io
    this.app.io = this.app.io
    this.app.io.of('/').on('connect', setupSocketFunctions(this))

    await setupSubdomain(this)

    await startWebRTC(this)

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
    console.log('Server transport initialized')
  }
}
