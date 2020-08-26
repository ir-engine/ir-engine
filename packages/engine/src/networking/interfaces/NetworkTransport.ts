import { DataProducer } from "mediasoup/lib/types"
import { DataProducer as ClientDataProducer } from "mediasoup-client/lib/types"
import { UnreliableMessageParams } from "../types/NetworkingTypes"

export interface NetworkTransport {
  initialize(address?: string, port?: number): void | Promise<void>
  sendReliableMessage(params: any): void
  sendUnreliableMessage(data: any, channel?: string, params?: any): Promise<ClientDataProducer | DataProducer | Error>
}
