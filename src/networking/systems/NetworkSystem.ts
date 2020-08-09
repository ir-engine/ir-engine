import { System } from "ecsy"
import { Network as NetworkComponent } from "../components/Network"
import { NetworkClient } from "../components/NetworkClient"
import { NetworkObject } from "../components/NetworkObject"

export class NetworkSystem extends System {
  public static instance: NetworkSystem

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
