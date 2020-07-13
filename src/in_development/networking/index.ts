import { World } from "ecsy"
import NetworkedComponent from "./components/NetworkedComponent"
import NetworkedPlayer from "./components/NetworkedPlayer"
import NetworkingSystem from "./systems/NetworkingSystem"

interface Options {
  debug: { type: boolean, default: false }
  transport: { type: Transport | null, default: null } // TODO: Default transport
}

export function initializeStateSystem(world: World, options: Options): void {
  if (options.debug) {
    console.log("Registering networking systems with the following options:")
    console.log(options)
  }

  world.registerSystem(NetworkingSystem)
  
  world
    .registerComponent(NetworkedComponent)
    .registerComponent(NetworkedPlayer)

  if (options.debug) console.log("NETWORKING: Registered systems.")
}
