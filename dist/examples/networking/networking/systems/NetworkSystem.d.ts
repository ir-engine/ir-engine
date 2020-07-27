import { System, Entity, World } from "ecsy";
import MessageSchema from "../classes/MessageSchema";
import NetworkTransportAlias from "../types/NetworkTransportAlias";
import MessageTypeAlias from "../types/MessageTypeAlias";
export declare class NetworkSystem extends System {
    static _schemas: Map<MessageTypeAlias, MessageSchema<any>>;
    _isInitialized: boolean;
    _sessionEntity: Entity;
    static _schema: MessageSchema<any>;
    _transport: NetworkTransportAlias;
    protected static _buffer: ArrayBuffer;
    protected static _dataView: DataView;
    protected static _bytes: number;
    static queries: any;
    execute(delta: number): void;
    static addMessageSchema<StructType>(messageType: MessageTypeAlias, messageData: StructType): MessageSchema<any>;
    initializeSession(world: World, transport?: NetworkTransportAlias): void;
    deinitializeSession(): void;
    static toBuffer(input: MessageSchema<any>): ArrayBuffer;
    static fromBuffer(buffer: ArrayBuffer): any;
    static flattenSchema(schema: MessageSchema<any>, data: any): any[];
}
