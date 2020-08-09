// TODO: Clean me up, add schema, etc
import { Component } from "ecsy"
import { RingBuffer } from "../../common/classes/RingBuffer"
import { Message } from "../interfaces/Message"
import { NetworkSchema } from "../interfaces/NetworkSchema"
import { NetworkTransport } from "../interfaces/NetworkTransport"

export class Network extends Component<any> {
  static instance: Network
  isInitialized: boolean
  transport: NetworkTransport
  schema: NetworkSchema
  clients: string[] = [] // TODO: Replace with ringbuffer
  mySocketID
  outgoingReliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  outgoingUnreliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  incomingReliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  incomingUnreliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  // TODO: Rename our other schema? Or these? We need these schemas to be understood to be buffered data

  constructor() {
    super()
    Network.instance = this
  }
}
