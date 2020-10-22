// Misc Types required for networking components

import { DataProducer } from "mediasoup/lib/types";
import { DataProducer as ClientDataProducer, SctpCapabilities } from "mediasoup-client/lib/types";
import { MessageTypeAlias } from "./MessageTypeAlias";

export type SendMessageTypeDetail = {
    type?: MessageTypeAlias;
    unreliableChannel?: string;
}

export type UnreliableMessageType = "json" | "raw"

export type UnreliableMessageReturn = DataProducer | ClientDataProducer | Error

export type CreateWebRtcTransportParams = {
    peerId?: string;
    direction: 'recv' | 'send';
    sctpCapabilities: SctpCapabilities;
}