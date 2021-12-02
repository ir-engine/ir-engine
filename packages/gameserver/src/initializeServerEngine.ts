import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import config from '@xrengine/server-core/src/appconfig'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

export const initializeServerEngine = async (systems: SystemModuleType<any>[], isMediaChannelInstance = false) => {
  const dbClientConfig = await app.service('client-setting').find()
  const [dbClientConfigData] = dbClientConfig.data
  const clientConfig = dbClientConfigData || config.client

  const options: InitializeOptions = {
    type: isMediaChannelInstance ? EngineSystemPresets.MEDIA : EngineSystemPresets.SERVER,
    publicPath: clientConfig.url,
    systems
  }
  await initializeEngine(options)
  systems.forEach((s) => {
    s.sceneSystem = true
  })
  await Engine.currentWorld.initSystems(systems)
}
