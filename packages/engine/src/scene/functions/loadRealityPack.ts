import { useWorld } from '../../ecs/functions/SystemHooks'
import { importPack } from '@xrengine/realitypacks/loader'
import { WorldScene } from './SceneLoading'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'

type RealityPackNodeArguments = {
  packName: string
  injectionPoint: SystemUpdateType
  args: any
}

/**
 * @author Abhishek Pathak
 * @author Josh Field
 * @param sceneLoader
 * @param entity
 * @param component
 * @param sceneProperty
 */

export const loadRealityPack = async (data: RealityPackNodeArguments) => {
  console.log(data)

  try {
    const downloadResult = await WorldScene.realityPackDownloadCallback(data.packName)
    if (!downloadResult) return console.warn(`[RealityPackLoader] Pack ${data.packName} could not be downloaded!`)

    const moduleEntryPoints = await importPack(data.packName)

    for (const entryPoint of moduleEntryPoints) {
      const factory = (await entryPoint).default
      const loadedSystem = await factory(useWorld(), data.args)
      const pipeline = data.injectionPoint ?? 'FIXED'
      useWorld().injectedSystems[pipeline].push({
        name: factory.name,
        execute: () => {
          loadedSystem()
        },
        type: pipeline
      })
    }
  } catch (e) {
    console.log(`[RealityPackLoader]: Failed to load reality pack with error ${e}`)
  }
}
