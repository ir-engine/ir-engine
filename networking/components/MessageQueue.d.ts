import { Component } from "ecsy";
import RingBuffer from "../../common/classes/RingBuffer";
import Message from "../interfaces/Message";
export default class MessageQueue extends Component<any> {
    static instance: MessageQueue;
    outgoingReliableQueue: RingBuffer<Message>;
    outgoingUnreliableQueue: RingBuffer<Message>;
    incomingReliableQueue: RingBuffer<Message>;
    incomingUnreliableQueue: RingBuffer<Message>;
    constructor();
}
