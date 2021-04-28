import { initializeServer } from "@xr3ngine/engine/src/initializeServer";
import { DefaultNetworkSchema } from "@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema";
import { SocketWebRTCServerTransport } from "./SocketWebRTCServerTransport";

// Patch XHR for FileLoader in threejs
import { XMLHttpRequest } from 'xmlhttprequest';
(globalThis as any).XMLHttpRequest = XMLHttpRequest; 
import config from '@xr3ngine/server-core/src/appconfig';

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
  publicPath: config.client.url
};

export class WebRTCGameServer {
  static instance: WebRTCGameServer = null
  constructor(app: any) {
    (options.networking as any).app = app;
    WebRTCGameServer.instance = this;
  }
  initialize() {
    return initializeServer(options);
  }
}
