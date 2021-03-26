import { initializeServer } from "@xr3ngine/engine/src/initialize";
import { CharacterStateSchema } from "@xr3ngine/engine/src/templates/character/CharacterStateSchema";
import { DefaultNetworkSchema } from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema";
import { SocketWebRTCServerTransport } from "./transports/SocketWebRTCServerTransport";

// Patch XHR for FileLoader in threejs
import { XMLHttpRequest } from 'xmlhttprequest';
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
(globalThis as any).XMLHttpRequest = XMLHttpRequest; 
import config from '../config'

const networkSchema = {
  ...DefaultNetworkSchema,
  transport: SocketWebRTCServerTransport
};

const options = {
  input: {
    useWebXR: false
  },
  networking: {
    schema: networkSchema
  },
  state: {
    schema: CharacterStateSchema
  }
};

export class WebRTCGameServer {
  static instance: WebRTCGameServer = null
  constructor(app: any) {
    (options.networking as any).app = app;
    WebRTCGameServer.instance = this;
    initializeServer(options).then(() => {
      Engine.publicPath = config.client.url;
    })
  }
}
