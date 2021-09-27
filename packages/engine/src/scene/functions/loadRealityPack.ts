import { useWorld } from '../../ecs/functions/SystemHooks'
import { importPack } from '@xrengine/realitypacks/loader'
import { InjectionPoint } from '../../ecs/functions/SystemFunctions'
import { WorldScene } from './SceneLoading'

type RealityPackNodeArguments = {
  packName: string
  injectionPoint: keyof typeof InjectionPoint
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
      const loadedSystem = await (await entryPoint).default(useWorld(), data.args)
      const pipeline = data.injectionPoint ?? 'FIXED'
      useWorld().injectedSystems[pipeline].push(loadedSystem)
    }
  } catch (e) {
    console.log(`[RealityPackLoader]: Failed to load reality pack with error ${e}`)
  }
}
