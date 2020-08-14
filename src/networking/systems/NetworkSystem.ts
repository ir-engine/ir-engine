import { System } from "../../ecs/classes/System"
import { Network as NetworkComponent, Network } from "../components/Network"
import { NetworkClient } from "../components/NetworkClient"
import { NetworkObject } from "../components/NetworkObject"
import { registerComponent, createEntity, addComponent } from "../../ecs"
import { NetworkGameState } from ".."
import { NetworkSchema } from "../interfaces/NetworkSchema"
import { DefaultNetworkSchema } from "../defaults/DefaultNetworkSchema"
import { NetworkTransport } from "../interfaces/NetworkTransport"

export class NetworkSystem extends System {
  init(schema?: NetworkSchema) {
    registerComponent(Network)
    registerComponent(NetworkClient)
    registerComponent(NetworkObject)
    registerComponent(NetworkGameState)

    // Create a Network entity (singleton)
    const networkEntity = createEntity("network")
    addComponent(networkEntity, Network)

    // Late initialization of network
    setTimeout(() => {
      Network.instance.schema = schema ?? DefaultNetworkSchema
      Network.instance.transport = ((schema && schema.transport) ?? DefaultNetworkSchema.transport) as NetworkTransport
      Network.instance.transport.initialize()
      Network.instance.isInitialized = true
    }, 1)
  }
  public static instance: NetworkSystem = null

  static queries: any = {
    networkObject: {
      components: [NetworkObject]
    },
    networkOwners: {
      components: [NetworkClient]
    }
  }

  public execute(delta: number): void {
    if (!NetworkComponent.instance.isInitialized) return
  }
}
