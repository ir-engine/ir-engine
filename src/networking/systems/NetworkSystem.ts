import { System } from "../../ecs/System"
import { Network as NetworkComponent } from "../components/Network"
import { NetworkClient } from "../components/NetworkClient"
import { NetworkObject } from "../components/NetworkObject"

export class NetworkSystem extends System {
  init() {
    // Initialization of the network system happens here
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
