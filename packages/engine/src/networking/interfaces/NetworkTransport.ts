import { DataProducer } from "mediasoup/lib/types"
import { DataProducer as ClientDataProducer } from "mediasoup-client/lib/types"
import { UnreliableMessageParams } from "../types/NetworkingTypes"

export interface NetworkTransport {
  initialize(address?: string, port?: number): void | Promise<void>
  sendReliableMessage(params: any): void
  sendUnreliableMessage(params: UnreliableMessageParams): Promise<ClientDataProducer | DataProducer | Error>
}
