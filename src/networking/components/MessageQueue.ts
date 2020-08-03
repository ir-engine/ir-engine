// TODO: Clean me up, add schema, etc
import { Component } from "ecsy"
import RingBuffer from "../../common/classes/RingBuffer"
import Message from "../interfaces/Message"

export default class MessageQueue extends Component<any> {
  static instance: MessageQueue
  outgoingReliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  outgoingUnreliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  incomingReliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  incomingUnreliableQueue: RingBuffer<Message> = new RingBuffer<Message>(200)
  // TODO: Message ring buffer should be able to grow

  constructor() {
    super()
    MessageQueue.instance = this
  }
}
