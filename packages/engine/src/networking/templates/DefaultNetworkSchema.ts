import { MessageTypes } from '../enums/MessageTypes'
import { NetworkSchema } from '../interfaces/NetworkSchema'

export const DefaultNetworkSchema: NetworkSchema = {
  transport: null,
  messageTypes: {
    ...MessageTypes
  }
}
