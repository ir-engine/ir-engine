/* eslint-disable @typescript-eslint/no-empty-function */
import { NetworkEventBehavior } from "../interfaces/NetworkEventBehavior"
import { MessageTypeAlias } from "../types/MessageTypeAlias"
import { createNetworkPrefab } from "./NetworkPrefabFunctions"
import { Network } from "../components/Network"
import { WorldComponent } from "../../common/components/WorldComponent"
import { MessageChannel } from "../enums/MessageChannel"
import { RingBuffer } from "../../common/classes/RingBuffer"
import { MediaStreamComponent } from "../components/MediaStreamComponent"
import { constructInstance } from "../../common/functions/constructInstance"

export function initializeNetworkSession(world: World, networkSchema: NetworkSchema, transportClass?: any) {
  console.log("Initialization session")
  const transport = constructInstance<NetworkTransport>(transportClass)
  const entity = world.createEntity()
  entity.addComponent(Network)

  if (transport.supportsMediaStreams) {
    entity.addComponent(MediaStreamComponent)
  }

  Network.instance.schema = networkSchema
  Network.instance.transport = transport
  transport.initialize()
  Network.instance.isInitialized = true
}

export const handleClientConnected: NetworkEventBehavior = (clientID: string): void => {
  console.log("Client ", clientID, " connected.")
  // create a network prefab using network schema
  createNetworkPrefab(
    // Prefab from the Network singleton's schema, using the defaultClientPrefab as a key
    (Network.instance as Network).schema.prefabs[(Network.instance as Network).schema.defaultClientPrefab],
    // Singleton reference to the current world
    (WorldComponent.instance as WorldComponent).world,
    // Connecting client's ID as a string
    clientID
  )
}

export const handleClientDisconnected = (clientID: String): void => {
  console.log("Client ", clientID, " disconnected.")
  // Remove the network prefab using network schema
  // TODO
  // removeNetworkEntityWithPrefab(clientID, (Network.instance as Network).schema.defaultClientPrefab)
}

let instance: Network
export const handleMessage = (messageData: any): void => {
  instance = Network.instance
  instance.schema.messageHandlers[messageType].behavior({ ...instance.schema.messageHandlers[messageType].args, messageData })
}

let queue: RingBuffer<any>
export const sendMessage = (messageChannel: MessageChannel, messageType: MessageTypeAlias, messageData: any): void => {
  instance = Network.instance
  queue = messageChannel === MessageChannel.Reliable ? instance.outgoingReliableQueue : instance.outgoingUnreliableQueue
  queue.add(messageType, messageData)
}
