import { initializeEngine } from "@xr3ngine/engine/src/initialize"
import { SocketWebRTCServerTransport } from "./transports/SocketWebRTCServerTransport"
import { DefaultNetworkSchema } from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema"
import { CharacterSubscriptionSchema } from "@xr3ngine/engine/src/templates/character/CharacterSubscriptionSchema"
import { CharacterStateSchema } from "@xr3ngine/engine/src/templates/character/CharacterStateSchema"

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
    schema: CharacterStateSchema
  },
  subscriptions: {
    enabled: true,
    schema: CharacterSubscriptionSchema
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
  },
  camera: {
    enabled: false
  },
  audio: {
    enabled: false
  }
}

export class WebRTCGameServer {
  constructor(app: any) {
    (options.networking as any).app = app
    initializeEngine(options)
  }
}
