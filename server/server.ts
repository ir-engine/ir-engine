import { World } from "ecsy"
import { initializeNetworking } from "../src/index"
import SocketWebRTCServerTransport from "./transports/SocketWebRTCServerTransport"

export default class SocketWebRTCServer {
  lastTime: number = Date.now()
  world = new World()
  time = Date.now()
  delta
  constructor() {
    initializeNetworking(this.world, new SocketWebRTCServerTransport())
    this.update()
  }

  update(): void {
    this.delta = this.time - this.lastTime
    this.lastTime = this.time
    this.world.execute(this.delta)
    setImmediate(this.update)
  }
}
