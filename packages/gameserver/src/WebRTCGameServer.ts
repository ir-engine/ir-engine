// Patch XHR for FileLoader in threejs
import { XMLHttpRequest } from 'xmlhttprequest';
import { initializeEngine } from "@xrengine/engine/src/initializeEngine";
import { NetworkSchema } from "@xrengine/engine/src/networking/interfaces/NetworkSchema";
import config from '@xrengine/server-core/src/appconfig';
import { SocketWebRTCServerTransport } from "./SocketWebRTCServerTransport";
import { EngineSystemPresets } from '@xrengine/engine/src/DefaultInitializationOptions';

(globalThis as any).XMLHttpRequest = XMLHttpRequest;

const options = {
  type: EngineSystemPresets.SERVER,
  networking: {
    schema: {
      transport: SocketWebRTCServerTransport
    } as NetworkSchema,
    publicPath: config.client.url
  },
};

export class WebRTCGameServer {
  static instance: WebRTCGameServer = null
  constructor(app: any) {
    (options.networking as any).app = app;
    WebRTCGameServer.instance = this;
  }
  initialize() {
    return initializeEngine(options);
  }
}
