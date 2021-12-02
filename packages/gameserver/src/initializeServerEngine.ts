import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import config from '@xrengine/server-core/src/appconfig'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const initializeServerEngine = async (app, systems: SystemModuleType<any>[], isMediaChannelInstance = false) => {
  const dbClientConfig = await app.service('client-setting').find()
  const [dbClientConfigData] = dbClientConfig.data
  const clientConfig = dbClientConfigData || config.client

  const options: InitializeOptions = {
    type: isMediaChannelInstance ? EngineSystemPresets.MEDIA : EngineSystemPresets.SERVER,
    publicPath: clientConfig.url,
    systems
  }
  return initializeEngine(options)
}
