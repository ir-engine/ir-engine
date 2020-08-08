import { World } from "ecsy"
import { initializeArmada, DefaultStateSchema } from "../src/index"
import SocketWebRTCServerTransport from "./transports/SocketWebRTCServerTransport"
import { DefaultNetworkSchema } from "../src/networking/defaults/DefaultNetworkSchema"
import DefaultSubscriptionSchema from "../src/subscription/defaults/DefaultSubscriptionSchema"

const networkSchema = {
  ...DefaultNetworkSchema,
  transport: SocketWebRTCServerTransport
}

const options = {
  debug: false,
  withTransform: true,
  withWebXRInput: true,
  input: {
    enabled: false
  },
  networking: {
    enabled: true,
    schema: networkSchema,
    supportsMediaStreams: true
  },
  state: {
    enabled: true,
    schema: DefaultStateSchema
  },
  subscriptions: {
    enabled: true,
    schema: DefaultSubscriptionSchema
  },
  physics: {
    enabled: false
  },
  particles: {
    enabled: false
  },
  transform: {
    enabled: true
  }
}

export default class SocketWebRTCServer {
  lastTime: number = Date.now()
  time = Date.now()
  delta
  constructor() {
    const world = new World()
    initializeArmada(world, options)
    this.update(world)
  }

  update(world: World): void {
    this.delta = this.time - this.lastTime
    this.lastTime = this.time
    world.execute()
    setImmediate(() => this.update(world))
  }
}
