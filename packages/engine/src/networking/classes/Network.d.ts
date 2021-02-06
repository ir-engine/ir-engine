/// <reference types="socket.io" />
import { Schema } from "superbuffer";
import { RingBuffer } from '../../common/classes/RingBuffer';
import { Entity } from '../../ecs/classes/Entity';
import { NetworkObjectList } from '../interfaces/NetworkObjectList';
import { NetworkSchema } from '../interfaces/NetworkSchema';
import { NetworkTransport } from '../interfaces/NetworkTransport';
import { WorldStateInterface } from "../interfaces/WorldState";
import { Snapshot } from "../types/SnapshotDataTypes";
export interface NetworkClientList {
    [key: string]: {
        userId?: string;
        name?: string;
        socket?: SocketIO.Socket;
        socketId?: string;
        lastSeenTs?: any;
        joinTs?: any;
        media?: {};
        consumerLayers?: {};
        stats?: {};
        instanceSendTransport?: any;
        instanceRecvTransport?: any;
        channelSendTransport?: any;
        channelRecvTransport?: any;
        dataConsumers?: Map<string, any>;
        dataProducers?: Map<string, any>;
    };
}
/** Component Class for Network. */
export declare class Network {
    /** Static instance to access everywhere. */
    static instance: Network;
    /** Indication of whether the network is initialized or not. */
    isInitialized: boolean;
    /** Whether to apply compression on packet or not. */
    packetCompression: boolean;
    /** we dont senr unit64 now, then its a value to -minus from time to get a little value for unit32 */
    timeSnaphotCorrection: number;
    /** Object holding transport details over network. */
    transport: NetworkTransport;
    /** Network transports. */
    transports: any[];
    /** Schema of the component. */
    schema: NetworkSchema;
    /** Clients connected over this network. */
    clients: NetworkClientList;
    /** Newly connected clients over this network in this frame. */
    clientsConnected: any[];
    /** Disconnected client in this frame. */
    clientsDisconnected: any[];
    /** List of data producer nodes. */
    dataProducers: Map<string, any>;
    /** List of data consumer nodes. */
    dataConsumers: Map<string, any>;
    /** Newly created Network Objects in this frame. */
    createObjects: any[];
    /** Destroyed Network Objects in this frame. */
    destroyObjects: any[];
    /** Map of Network Objects. */
    networkObjects: NetworkObjectList;
    localClientEntity: Entity;
    /** Socket id of the network. */
    socketId: string;
    /** User id hosting this network. */
    userId: string;
    /** Access tocken of the User. */
    accessToken: string;
    /** Snapshot of the network. */
    snapshot: Snapshot;
    /** ID of last network created. */
    private static availableNetworkId;
    /** Get next network id. */
    static getNetworkId(): number;
    /** Schema of the network. */
    static _schemas: Map<string, Schema>;
    /** Buffer holding all incoming Messages. */
    incomingMessageQueue: RingBuffer<any>;
    /** State of the world. */
    worldState: WorldStateInterface;
    /**
     * Attached ID of scene attached with this network.
     * @default 547Y45f7
     */
    static sceneId: string;
    /** Network. */
    static Network: any;
    /** Tick of the network. */
    static tick: any;
    /** Constructs the network. */
    constructor();
    /** Disposes the network. */
    dispose(): void;
}
