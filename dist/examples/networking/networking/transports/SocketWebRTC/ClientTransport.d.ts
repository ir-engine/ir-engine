/// <reference types="node" />
/// <reference types="socket.io-client" />
import * as mediasoup from "mediasoup-client";
import NetworkTransport from "../../interfaces/NetworkTransport";
export default class SocketWebRTCClientTransport implements NetworkTransport {
    supportsMediaStreams: boolean;
    mediasoupDevice: mediasoup.Device;
    joined: boolean;
    recvTransport: any;
    sendTransport: any;
    lastPollSyncData: {};
    pollingInterval: NodeJS.Timeout;
    heartbeatInterval: number;
    pollingTickRate: number;
    socket: SocketIOClient.Socket;
    request: any;
    sendAllReliableMessages(): void;
    initialize(address?: string, port?: number): Promise<void>;
    joinWorld(): Promise<void>;
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
