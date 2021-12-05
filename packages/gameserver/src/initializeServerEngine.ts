import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import config from '@xrengine/server-core/src/appconfig'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

export const initializeServerEngine = async (systems: SystemModuleType<any>[], isMediaChannelInstance = false) => {
  const options: InitializeOptions = {
    type: isMediaChannelInstance ? EngineSystemPresets.MEDIA : EngineSystemPresets.SERVER,
    publicPath: config.client.url,
    systems
  }
  await initializeEngine(options)
  systems.forEach((s) => {
    s.sceneSystem = true
  })
  await Engine.defaultWorld.initSystems(systems)
}
