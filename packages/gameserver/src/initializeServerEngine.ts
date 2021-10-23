// Patch XHR for FileLoader in threejs
import { XMLHttpRequest } from 'xmlhttprequest'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import config from '@xrengine/server-core/src/appconfig'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
;(globalThis as any).XMLHttpRequest = XMLHttpRequest
;(globalThis as any).self = globalThis

export const initializeServerEngine = (systems: SystemModuleType<any>[], isMediaChannelInstance = false) => {
  const options: InitializeOptions = {
    type: isMediaChannelInstance ? EngineSystemPresets.MEDIA : EngineSystemPresets.SERVER,
    publicPath: config.client.url,
    systems
  }
  return initializeEngine(options)
}
