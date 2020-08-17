import { RingBuffer } from "../../common/classes/RingBuffer";
import { Message } from "../interfaces/Message";
import { NetworkSchema } from "../interfaces/NetworkSchema";
import { NetworkTransport } from "../interfaces/NetworkTransport";
import { Component } from "../../ecs/classes/Component";
export declare class Network extends Component<any> {
    static instance: Network;
    isInitialized: boolean;
    transport: NetworkTransport;
    schema: NetworkSchema;
    clients: string[];
    mySocketID: any;
    outgoingReliableQueue: RingBuffer<Message>;
    outgoingUnreliableQueue: RingBuffer<Message>;
    incomingReliableQueue: RingBuffer<Message>;
    incomingUnreliableQueue: RingBuffer<Message>;
    static Network: any;
    constructor();
}
