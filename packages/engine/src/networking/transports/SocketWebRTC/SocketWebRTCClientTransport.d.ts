/// <reference types="node" />
/// <reference types="socket.io-client" />
import mediasoupClient from "mediasoup-client";
import { NetworkTransport } from "../../interfaces/NetworkTransport";
export declare class SocketWebRTCClientTransport implements NetworkTransport {
    mediasoupDevice: mediasoupClient.Device;
    joined: boolean;
    recvTransport: mediasoupClient.types.Transport;
    sendTransport: mediasoupClient.types.Transport;
    lastPollSyncData: {};
    pollingInterval: NodeJS.Timeout;
    heartbeatInterval: number;
    pollingTickRate: number;
    dataProducers: Map<string, mediasoupClient.types.DataProducer>;
    dataConsumers: Map<string, mediasoupClient.types.DataConsumer>;
    socket: SocketIOClient.Socket;
    request: any;
    sendAllReliableMessages(): void;
    sendAllUnReliableMessages(): void;
    handleConsumerMessage: (consumerLabel: string, channelId: string, callback: (data: any) => void) => (message: any) => void;
    sendUnreliableMessage({ callback, channelId, data, type }: {
        channelId: string;
        data: any;
        type: string;
        callback?: (data: any) => void;
    }): Promise<mediasoupClient.types.DataProducer>;
    promisedRequest(socket: SocketIOClient.Socket): (type: any, data?: {}) => any;
    initialize(address?: string, port?: number): Promise<void>;
    joinWorld(): Promise<void>;
    initRecv(): Promise<void>;
    sendCameraStreams(): Promise<void>;
    startScreenshare(): Promise<boolean>;
    stopSendingMediaStreams(): Promise<boolean>;
    leave(): Promise<boolean>;
    subscribeToTrack(peerId: string, mediaTag: string): Promise<void>;
    unsubscribeFromTrack(peerId: any, mediaTag: any): Promise<void>;
    pauseConsumer(consumer: {
        appData: {
            peerId: any;
            mediaTag: any;
        };
        id: any;
        pause: () => any;
    }): Promise<void>;
    resumeConsumer(consumer: {
        appData: {
            peerId: any;
            mediaTag: any;
        };
        id: any;
        resume: () => any;
    }): Promise<void>;
    pauseProducer(producer: {
        appData: {
            mediaTag: any;
        };
        id: any;
        pause: () => any;
    }): Promise<void>;
    resumeProducer(producer: {
        appData: {
            mediaTag: any;
        };
        id: any;
        resume: () => any;
    }): Promise<void>;
    closeConsumer(consumer: any): Promise<void>;
    createTransport(direction: string): Promise<any>;
    pollAndUpdate(): Promise<void>;
}
