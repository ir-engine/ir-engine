import { Consumer, DataProducer, Producer, Router, Transport, WebRtcTransport, Worker } from 'mediasoup/node/lib/types'

import { MediaStreamAppData } from '@xrengine/common/src/interfaces/MediaStreamConstants'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
import { WorldState } from '@xrengine/engine/src/networking/interfaces/WorldState'
import { clearOutgoingActions, getState } from '@xrengine/hyperflux'
import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'
import { Action, Topic } from '@xrengine/hyperflux/functions/ActionFunctions'
import { Application } from '@xrengine/server-core/declarations'
import multiLogger from '@xrengine/server-core/src/ServerLogger'

import { setupSubdomain } from './NetworkFunctions'
import { startWebRTC } from './WebRTCFunctions'

const logger = multiLogger.child({ component: 'instanceserver:webrtc:network' })

export type WebRTCTransportExtension = WebRtcTransport & { appData: MediaStreamAppData }

export class SocketWebRTCServerNetwork extends Network {
  workers: Worker[] = []
  routers: Record<string, Router[]>
  transport: Transport
  app: Application

  outgoingDataTransport: Transport
  outgoingDataProducer: DataProducer
  request = () => null!

  mediasoupTransports: WebRTCTransportExtension[] = []
  transportsConnectPending: Promise<void>[] = []

  producers = [] as Producer[]
  consumers = [] as Consumer[]

  constructor(hostId: UserId, topic: Topic, app: Application) {
    super(hostId, topic)
    this.app = app
    ActionFunctions.addOutgoingTopicIfNecessary(topic)
  }

  public updatePeers = () => {
    const userNames = getState(WorldState).userNames
    const peers = Array.from(this.peers.values()).map((peer) => {
      return {
        userId: peer.userId,
        index: peer.index,
        name: userNames[peer.userId].value
      }
    })
    if (peers.length)
      for (const [socketID, socket] of this.app.io.of('/').sockets)
        socket.emit(MessageTypes.UpdatePeers.toString(), peers)
  }

  public sendActions = (): any => {
    if (!this.ready) return

    const actions = [...Engine.instance.store.actions.outgoing[this.topic].queue]
    if (!actions.length) return

    const userIdMap = {} as { [socketId: string]: UserId }
    for (const [id, client] of this.peers) userIdMap[client.socketId!] = id
    const outgoing = Engine.instance.store.actions.outgoing

    for (const [socketID, socket] of this.app.io.of('/').sockets) {
      const arr: Action[] = []
      for (const a of [...actions]) {
        const action = { ...a }
        if (outgoing[this.topic].historyUUIDs.has(action.$uuid)) {
          const idx = outgoing[this.topic].queue.indexOf(action)
          outgoing[this.topic].queue.splice(idx, 1)
        }
        if (!action.$to) continue
        const toUserId = userIdMap[socketID]
        if (action.$to === 'all' || (action.$to === 'others' && toUserId !== action.$from) || action.$to === toUserId) {
          arr.push(action)
        }
      }
      if (arr.length) socket.emit(MessageTypes.ActionData.toString(), /*encode(*/ arr) //)
    }

    // TODO: refactor this to support multiple connections of the same topic type
    clearOutgoingActions(this.topic, Engine.instance.store)
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
