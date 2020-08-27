import { initializeEngine } from "@xr3ngine/engine/src/initialize"
import { SocketWebRTCServerTransport } from "./transports/SocketWebRTCServerTransport"
import { DefaultNetworkSchema } from "@xr3ngine/engine/src/templates/network/DefaultNetworkSchema"
import { DefaultSubscriptionSchema } from "@xr3ngine/engine/src/templates/character/CharacterSubscriptionSchema"
import { DefaultStateSchema } from "@xr3ngine/engine/src/templates/character/CharacterStateSchema"

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
    supportsMediaStreams: true,
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

export class WebRTCGameServer {
  constructor() {
    initializeEngine(options)
  }
}
