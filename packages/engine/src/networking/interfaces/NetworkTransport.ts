import { DataProducer } from "mediasoup/lib/types"
import { DataProducer as ClientDataProducer } from "mediasoup-client/lib/types"

export interface NetworkTransport {
  isServer: boolean
  initialize(address?: string, port?: number, opts?: Object): void | Promise<void>
  sendData(data: any, channel?: string, params?: any): Promise<ClientDataProducer | DataProducer | Error>
  sendReliableData(data: any): void
}
