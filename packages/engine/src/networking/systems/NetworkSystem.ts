import { System } from "../../ecs/classes/System"
import { Network, Network as NetworkComponent } from "../components/Network"
import { NetworkClient } from "../components/NetworkClient"
import { NetworkObject } from "../components/NetworkObject"
import { DefaultNetworkSchema } from "../defaults/DefaultNetworkSchema"
import { NetworkSchema } from "../interfaces/NetworkSchema"
import { NetworkGameState } from "../components/NetworkInterpolation"
import { createEntity, addComponent } from "../../ecs/functions/EntityFunctions"

export class NetworkSystem extends System {
  init(schema?: NetworkSchema) {
    // Create a Network entity (singleton)
    const networkEntity = createEntity("network")
    addComponent(networkEntity, Network)

    // Late initialization of network
    setTimeout(() => {
      Network.instance.schema = schema ?? DefaultNetworkSchema
      Network.instance.transport = new (Network.instance.schema.transport as any)()
      Network.instance.transport.initialize()
      Network.instance.isInitialized = true
    }, 1)
  }
  public static instance: NetworkSystem = null

  static queryResults: any = {
    gameState: {
      components: [NetworkGameState]
    },
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
