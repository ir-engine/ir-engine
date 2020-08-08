import { NetworkEventBehavior } from "../interfaces/NetworkEventBehavior"
import MessageTypeAlias from "../types/MessageTypeAlias"
import { NetworkMessageBehavior } from "../interfaces/NetworkMessageBehavior"

export const handleClientConnected: NetworkEventBehavior = (clientID: string, localPlayer?: boolean): void => {
  console.log("Client ", clientID, " connected.")
  // create a network assemblage using network schema
}

export const handleClientDisconnected: NetworkEventBehavior = (clientID: string, localPlayer?: boolean): void => {
  console.log("Client ", clientID, " disconnected.")
}

export const handleReliableMessage: NetworkMessageBehavior = (messageType: MessageTypeAlias, messageData: any): void => {

}

export const handleUnreliableMessage: NetworkMessageBehavior = (messageType: MessageTypeAlias, messageData: any): void => {

}
