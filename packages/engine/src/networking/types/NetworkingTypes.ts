// Misc Types required for networking components

import { DataProducer as ClientDataProducer, SctpCapabilities } from "mediasoup-client/lib/types";
import { DataProducer } from "mediasoup/lib/types";


export type UnreliableMessageType = "json" | "raw"

export type UnreliableMessageReturn = DataProducer | ClientDataProducer | Error

export type CreateWebRtcTransportParams = {
    peerId?: string;
    direction: 'recv' | 'send';
    sctpCapabilities: SctpCapabilities;
    partyId?: string;
}