/* eslint-disable @typescript-eslint/no-empty-function */
import { NetworkEventBehavior } from "../interfaces/NetworkEventBehavior"
import { NetworkMessageBehavior } from "../interfaces/NetworkMessageBehavior"
import { MessageTypeAlias } from "../types/MessageTypeAlias"

export const handleClientConnected: NetworkEventBehavior = (clientID: string, localPlayer?: boolean): void => {
  console.log("Client ", clientID, " connected.")
  // create a network assemblage using network schema
}

export const handleClientDisconnected: NetworkEventBehavior = (clientID: string, localPlayer?: boolean): void => {
  console.log("Client ", clientID, " disconnected.")
  // Remove the network assemblage
}

export const handleReliableMessage: NetworkMessageBehavior = (messageType: MessageTypeAlias, messageData: any): void => {}

export const handleUnreliableMessage: NetworkMessageBehavior = (messageType: MessageTypeAlias, messageData: any): void => {}
