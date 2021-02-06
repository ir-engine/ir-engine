/// <reference types="socket.io-client" />
/// <reference types="node" />
import { NetworkTransport } from "@xr3ngine/engine/src/networking/interfaces/NetworkTransport";
import * as mediasoupClient from "mediasoup-client";
import { Transport as MediaSoupTransport } from "mediasoup-client/lib/types";
export declare class SocketWebRTCClientTransport implements NetworkTransport {
    isServer: boolean;
    mediasoupDevice: mediasoupClient.Device;
    leaving: boolean;
    instanceRecvTransport: MediaSoupTransport;
    instanceSendTransport: MediaSoupTransport;
    channelRecvTransport: MediaSoupTransport;
    channelSendTransport: MediaSoupTransport;
    lastPollSyncData: {};
    pollingTickRate: number;
    pollingTimeout: number;
    socket: SocketIOClient.Socket;
    request: any;
    localScreen: any;
    lastPoll: Date;
    pollPending: boolean;
    videoEnabled: boolean;
    channelType: string;
    channelId: string;
    dataProducer: any;
    /**
   * Send a message over TCP with websockets
   * @param message message to send
   */
    sendReliableData(message: any): void;
    handleKick(socket: any): void;
    toBuffer(ab: any): Buffer;
    sendData(data: any, channel?: string): void;
    promisedRequest(socket: SocketIOClient.Socket): (type: any, data?: {}) => any;
    initialize(address?: string, port?: number, opts?: any): Promise<void>;
}
