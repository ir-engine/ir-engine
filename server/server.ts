import { World } from "ecsy"
import { initializeNetworking } from "../src/index"
import SocketWebRTCServerTransport from "./transports/SocketWebRTCServerTransport"

export default class SocketWebRTCServer {
  lastTime: number = Date.now()
  time = Date.now()
  delta
  constructor() {
    const world = new World()
    initializeNetworking(world, new SocketWebRTCServerTransport())
    this.update(world)
  }

  update(world: World): void {
    this.delta = this.time - this.lastTime
    this.lastTime = this.time
    world.execute()
    setImmediate(() => this.update(world))
  }
}
