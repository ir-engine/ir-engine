import * as https from 'https'
import { DataProducer, Router, Transport, WebRtcTransport, Worker } from 'mediasoup/node/lib/types'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { Action } from '@xrengine/hyperflux/functions/ActionFunctions'
import { Application } from '@xrengine/server-core/declarations'
import multiLogger from '@xrengine/server-core/src/logger'

import { setupSubdomain } from './NetworkFunctions'
import { startWebRTC } from './WebRTCFunctions'

const logger = multiLogger.child({ component: 'instanceserver:webrtc:network' })

export class SocketWebRTCServerNetwork extends Network {
  workers: Worker[] = []
  routers: Record<string, Router[]>
  transport: Transport
  app: Application

  outgoingDataTransport: Transport
  outgoingDataProducer: DataProducer
  request = () => null!

  mediasoupTransports: WebRtcTransport[] = []
  transportsConnectPending: Promise<void>[] = []

  constructor(hostId: string, app: Application) {
    super(hostId)
    this.app = app
  }

  public sendActions = (actions: Array<Required<Action>>): any => {
    if (!actions.length) return
    const world = Engine.instance.currentWorld
    const clients = world.clients
    const userIdMap = {} as { [socketId: string]: UserId }
    for (const [id, client] of clients) userIdMap[client.socketId!] = id
    const outgoing = Engine.instance.store.actions.outgoing

    for (const [socketID, socket] of this.app.io.of('/').sockets) {
      const arr: Action[] = []
      for (const a of [...actions]) {
        const action = { ...a }
        action.$topic = undefined!
        if (outgoing[this.hostId].historyUUIDs.has(action.$uuid)) {
          const idx = outgoing[this.hostId].queue.indexOf(action)
          outgoing[this.hostId].queue.splice(idx, 1)
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
    logger.info('Server transport initialized.')
  }
}
