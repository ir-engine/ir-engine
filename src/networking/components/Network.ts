// TODO: Clean me up, add schema, etc
import { RingBuffer } from "../../common/classes/RingBuffer"
import { Component, Types } from "../../ecs"
import { Message } from "../interfaces/Message"
import { NetworkSchema } from "../interfaces/NetworkSchema"
import { NetworkTransport } from "../interfaces/NetworkTransport"

export class Network extends Component<any> {
  static instance: Network = null
  isInitialized: boolean
  transport: NetworkTransport
  schema: NetworkSchema
  clients: string[] = [] // TODO: Replace with ringbuffer
  mySocketID
  outgoingReliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  outgoingUnreliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  incomingReliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  incomingUnreliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  static Network: any
  constructor() {
    super()
    Network.instance = this
  }
}

Network.schema = {
  isInitialized: { type: Types.Boolean },
  transport: { type: Types.Ref },
  schema: { type: Types.Ref },
  clients: { type: Types.Array },
  mySocketID: { type: Types.String },
  outgoingReliableQueue: { type: Types.Ref, default: new RingBuffer<Message>(200) },
  outgoingUnreliableQueue: { type: Types.Ref, default: new RingBuffer<Message>(200) },
  incomingReliableQueue: { type: Types.Ref, default: new RingBuffer<Message>(200) },
  incomingUnreliableQueue: { type: Types.Ref, default: new RingBuffer<Message>(200) }
}
