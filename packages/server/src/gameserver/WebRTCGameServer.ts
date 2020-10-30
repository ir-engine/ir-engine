import { initializeEngine } from "@xr3ngine/engine/src/initialize";
import { CharacterStateSchema } from "@xr3ngine/engine/src/templates/character/CharacterStateSchema";
import { DefaultNetworkSchema } from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema";
import { SocketWebRTCServerTransport } from "./transports/SocketWebRTCServerTransport";

const networkSchema = {
  ...DefaultNetworkSchema,
  transport: SocketWebRTCServerTransport
};

const options = {
  input: {
    useWebXR: true
  },
  networking: {
    schema: networkSchema
  },
  state: {
    schema: CharacterStateSchema
  }
};

export class WebRTCGameServer {
  constructor(app: any) {
    (options.networking as any).app = app;
    initializeEngine(options);
  }
}
