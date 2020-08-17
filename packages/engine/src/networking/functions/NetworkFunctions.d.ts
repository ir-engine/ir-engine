import { MessageChannel } from "../enums/MessageChannel";
import { MessageTypeAlias } from "../types/MessageTypeAlias";
export declare const handleClientConnected: (clientID: string) => void;
export declare const handleClientDisconnected: (clientID: String) => void;
export declare const handleMessage: (messageType: MessageTypeAlias, messageData: any) => void;
export declare const sendMessage: (messageChannel: MessageChannel, messageType: MessageTypeAlias, messageData: any) => void;
