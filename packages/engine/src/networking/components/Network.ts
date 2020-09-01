import { NetworkSchema } from '../interfaces/NetworkSchema';
import { NetworkTransport } from '../interfaces/NetworkTransport';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { Message } from '../interfaces/Message';
import { RingBuffer } from '../../common/classes/RingBuffer';
import { MessageSchema } from '../classes/MessageSchema';

export class Network extends Component<Network> {
  static instance: Network = null
  isInitialized: boolean
  transport: NetworkTransport
  schema: NetworkSchema
  clients: string[] = [] // TODO: Replace with ringbuffer
  mySocketID
  static _schemas: Map<string, MessageSchema> = new Map()

  incomingMessageQueue: RingBuffer<ArrayBuffer>
  outgoingReliableMessageQueue: RingBuffer<ArrayBuffer>

  worldState = {}

  outgoingUnreliableMessageQueue: RingBuffer<ArrayBuffer>

  static Network: any
  constructor () {
    super();
    Network.instance = this;
    console.log("Network instance exists")
    this.worldState = {}
    // TODO: Replace default message queue sizes
    this.outgoingReliableMessageQueue = new RingBuffer<ArrayBuffer>(100)
    this.incomingMessageQueue = new RingBuffer<ArrayBuffer>(100)
    this.outgoingUnreliableMessageQueue = new RingBuffer<ArrayBuffer>(100)
  }

  dispose():void {
    super.dispose();
    // TODO: needs tests
    this.clients.length = 0;
    this.transport = null
    Network.instance = null;
  }
}

Network.schema = {
  isInitialized: { type: Types.Boolean },
  transport: { type: Types.Ref },
  schema: { type: Types.Ref },
  clients: { type: Types.Array },
  mySocketID: { type: Types.String }
};
