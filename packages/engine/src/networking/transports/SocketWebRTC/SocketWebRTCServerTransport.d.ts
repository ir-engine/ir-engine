/// <reference types="node" />
import { types as MediaSoupTypes } from "mediasoup";
import { types as MediaSoupClientTypes } from "mediasoup-client";
import * as https from "https";
import SocketIO, { Socket } from "socket.io";
import { NetworkTransport } from "../../interfaces/NetworkTransport";
export declare class SocketWebRTCServerTransport implements NetworkTransport {
    server: https.Server;
    socketIO: SocketIO.Server;
    worker: any;
    router: MediaSoupTypes.Router;
    transport: MediaSoupTypes.Transport;
    roomState: {
        activeSpeaker: {
            producerId: any;
            volume: any;
            peerId: any;
        };
        transports: {};
        producers: any[];
        consumers: any[];
        dataProducers: any[];
        dataConsumers: any[];
        peers: any[];
    };
    sendAllReliableMessages(): void;
    sendAllUnReliableMessages(): void;
    handleConsumeDataEvent: (socket: SocketIO.Socket) => (data: {
        consumerOptions: MediaSoupTypes.DataConsumerOptions;
        transportId: string;
    }, callback: (arg0: {
        dataConsumerOptions?: {
            id: string;
            sctpStreamParameters: MediaSoupClientTypes.SctpStreamParameters;
        };
        error?: any;
    }) => void) => Promise<void>;
    sendUnreliableMessage({ params: { id, appData, label, protocol, sctpStreamParameters }, transport }: {
        params: MediaSoupTypes.DataProducerOptions;
        transport: MediaSoupTypes.Transport;
    }): Promise<MediaSoupTypes.DataProducer>;
    initialize(address?: string, port?: number): Promise<void>;
    startMediasoup(): Promise<void>;
    closeTransport(transport: any): Promise<void>;
    closeProducer(producer: any): Promise<void>;
    closeProducerAndAllPipeProducers(producer: any, peerId: any): Promise<void>;
    closeConsumer(consumer: any): Promise<void>;
    createWebRtcTransport({ peerId, direction }: {
        peerId: any;
        direction: any;
    }): Promise<MediaSoupTypes.WebRtcTransport>;
}
