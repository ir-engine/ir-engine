import { initialize } from "../src/initialize"
import { SocketWebRTCServerTransport } from "./transports/SocketWebRTCServerTransport"
import { DefaultNetworkSchema } from "../src/networking/defaults/DefaultNetworkSchema"
import { DefaultSubscriptionSchema } from "../src/subscription/defaults/DefaultSubscriptionSchema"
import { DefaultStateSchema } from "../src/state/defaults/DefaultStateSchema"

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
    schema: networkSchema
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
  },
  renderer: {
    enabled: false
  }
}

export class SocketWebRTCServer {
  constructor() {
    initialize(options)
  }
}
