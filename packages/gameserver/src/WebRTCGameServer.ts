import { initializeServer } from "@xrengine/engine/src/initializeServer";
import { DefaultNetworkSchema } from "@xrengine/engine/src/networking/templates/DefaultNetworkSchema";
import { SocketWebRTCServerTransport } from "./SocketWebRTCServerTransport";
import config from '@xrengine/server-core/src/appconfig';

const networkSchema = {
  ...DefaultNetworkSchema,
  transport: SocketWebRTCServerTransport
};

const options = {
  networking: {
    schema: networkSchema,
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
