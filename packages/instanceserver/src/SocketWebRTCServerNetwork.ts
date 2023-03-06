import {
  Consumer,
  DataProducer,
  Producer,
  Router,
  Transport,
  TransportInternal,
  WebRtcTransport,
  Worker
} from 'mediasoup/node/lib/types'

import { MediaStreamAppData } from '@etherealengine/common/src/interfaces/MediaStreamConstants'
import { PeersUpdateType } from '@etherealengine/common/src/interfaces/PeerID'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Network } from '@etherealengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@etherealengine/engine/src/networking/enums/MessageTypes'
import { WorldState } from '@etherealengine/engine/src/networking/interfaces/WorldState'
import { clearOutgoingActions, getState } from '@etherealengine/hyperflux'
import { Action, addOutgoingTopicIfNecessary, Topic } from '@etherealengine/hyperflux/functions/ActionFunctions'
import { Application } from '@etherealengine/server-core/declarations'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'

import { setupSubdomain } from './NetworkFunctions'
import { startWebRTC } from './WebRTCFunctions'

const logger = multiLogger.child({ component: 'instanceserver:webrtc:network' })

export type WebRTCTransportExtension = Omit<WebRtcTransport, 'appData'> & {
  appData: MediaStreamAppData
  internal: TransportInternal
}
export type ProducerExtension = Omit<Producer, 'appData'> & { appData: MediaStreamAppData }
export type ConsumerExtension = Omit<Consumer, 'appData'> & { appData: MediaStreamAppData }

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

  producers = [] as ProducerExtension[]
  consumers = [] as ConsumerExtension[]

  constructor(hostId: UserId, topic: Topic, app: Application) {
    super(hostId, topic)
    this.app = app
    addOutgoingTopicIfNecessary(topic)
  }

  public updatePeers = () => {
    const userNames = getState(WorldState).userNames
    const peers = Array.from(this.peers.values()).map((peer) => {
      return {
        peerID: peer.peerID,
        peerIndex: peer.peerIndex,
        userID: peer.userId,
        userIndex: peer.userIndex,
        name: userNames[peer.userId].value
      }
    }) as Array<PeersUpdateType>
    if (peers.length)
      this.app.primus.forEach((spark, id, connections) => {
        spark.write({ type: MessageTypes.UpdatePeers.toString(), data: peers })
      })
  }

  public sendActions = (): any => {
    if (!this.ready) return

    const actions = [...Engine.instance.store.actions.outgoing[this.topic].queue]
    if (!actions.length) return

    const outgoing = Engine.instance.store.actions.outgoing

    this.app.primus.forEach((spark, sparkId) => {
      const arr: Action[] = []
      for (const a of [...actions]) {
        const action = { ...a }
        if (outgoing[this.topic].historyUUIDs.has(action.$uuid)) {
          const idx = outgoing[this.topic].queue.indexOf(action)
          outgoing[this.topic].queue.splice(idx, 1)
        }
        if (!action.$to) continue
        const toUserId = this.peers.get(sparkId)?.userId
        if (action.$to === 'all' || (action.$to === 'others' && toUserId !== action.$from) || action.$to === toUserId) {
          arr.push(action)
        }
      }
      if (arr.length) spark.write({ type: MessageTypes.ActionData.toString(), /*encode(*/ data: arr }) //)
    })

    // TODO: refactor this to support multiple connections of the same topic type
    clearOutgoingActions(this.topic, Engine.instance.store)
  }

  public sendReliableData = (message: any): any => {
    if (this.app.primus != null)
      this.app.primus.forEach((spark) => {
        spark.write(MessageTypes.ReliableMessage.toString(), message)
      })
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
