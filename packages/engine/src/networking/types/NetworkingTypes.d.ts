import { DataProducer as ClientDataProducer, SctpCapabilities } from "mediasoup-client/lib/types";
import { DataProducer } from "mediasoup/lib/types";
export declare type UnreliableMessageType = "json" | "raw";
export declare type UnreliableMessageReturn = DataProducer | ClientDataProducer | Error;
export declare type CreateWebRtcTransportParams = {
    peerId?: string;
    direction: 'recv' | 'send';
    sctpCapabilities: SctpCapabilities;
    channelType: string;
    channelId?: string;
};
