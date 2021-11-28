import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import config from '@xrengine/server-core/src/appconfig'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const initializeServerEngine = (systems: SystemModuleType<any>[], isMediaChannelInstance = false) => {
  const options: InitializeOptions = {
    type: isMediaChannelInstance ? EngineSystemPresets.MEDIA : EngineSystemPresets.SERVER,
    publicPath: config.client.url,
    systems
  }
  return initializeEngine(options)
}
