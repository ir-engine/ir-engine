import NetworkTransport from "../../interfaces/NetworkTransport";
export default class SocketWebRTCServerTransport implements NetworkTransport {
    roomState: {
        peers: {};
        activeSpeaker: {
            producerId: any;
            volume: any;
            peerId: any;
        };
        transports: {};
        producers: any[];
        consumers: any[];
    };
    supportsMediaStreams: false;
    sendAllReliableMessages(): void;
    initialize(address?: string, port?: number): Promise<void>;
    startMediasoup(): Promise<void>;
    closePeer(peerId: any): void;
    closeTransport(transport: any): Promise<void>;
    closeProducer(producer: any): Promise<void>;
    closeProducerAndAllPipeProducers(producer: any, peerId: any): Promise<void>;
    closeConsumer(consumer: any): Promise<void>;
    createWebRtcTransport({ peerId, direction }: {
        peerId: any;
        direction: any;
    }): Promise<any>;
}
