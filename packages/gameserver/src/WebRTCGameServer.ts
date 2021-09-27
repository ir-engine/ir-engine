// Patch XHR for FileLoader in threejs
import { XMLHttpRequest } from 'xmlhttprequest'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import config from '@xrengine/server-core/src/appconfig'
import { SocketWebRTCServerTransport } from './SocketWebRTCServerTransport'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { WorldScene } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { download } from './downloadRealityPacks'
;(globalThis as any).XMLHttpRequest = XMLHttpRequest
;(globalThis as any).self = globalThis

export class WebRTCGameServer {
  static instance: WebRTCGameServer = new WebRTCGameServer()

  static options: InitializeOptions = {
    type: EngineSystemPresets.SERVER,
    networking: {
      schema: {
        transport: SocketWebRTCServerTransport
      } as NetworkSchema
    },
    publicPath: config.client.url,
    systems: []
  }

  initialize(app: any) {
    ;(WebRTCGameServer.options.networking as any).app = app
    WorldScene.realityPackDownloadCallback = download
    if ((app as any).isChannelInstance) {
      WebRTCGameServer.options.type = EngineSystemPresets.SERVER
    }
    return initializeEngine(WebRTCGameServer.options)
  }
}
