// Misc Types required for networking components

import { DataProducer } from "mediasoup/lib/types"
import { DataProducer as ClientDataProducer } from "mediasoup-client/lib/types"

export type UnreliableMessageType = "json" | "raw"

export type UnreliableMessageReturn = DataProducer | ClientDataProducer | Error
