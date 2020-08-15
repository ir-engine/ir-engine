import { initialize } from "./initialize"
import { SocketWebRTCServerTransport } from "./networking/transports/SocketWebRTC/SocketWebRTCServerTransport"
import { DefaultNetworkSchema } from "./networking/defaults/DefaultNetworkSchema"
import { DefaultSubscriptionSchema } from "./subscription/defaults/DefaultSubscriptionSchema"
import { DefaultStateSchema } from "./state/defaults/DefaultStateSchema"

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
