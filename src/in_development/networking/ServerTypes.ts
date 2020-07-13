import { Connection } from "@web-udp/client"
import { ConnectionType } from "./enums/ConnectionType"

export type Client = {
  sessionId: string
  unreliable?: Connection
  reliable?: Connection
}


export type ConnectionMetadata = {
  sessionId: string
  connectionType: ConnectionType
}
