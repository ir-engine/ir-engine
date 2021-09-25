import { useWorld } from '../../ecs/functions/SystemHooks'
import { importPack } from '@xrengine/realitypacks/loader'
import { InjectionPoint } from '../../ecs/functions/SystemFunctions'

type RealityPackNodeArguments = {
  packName: string
  injectionPoint: keyof typeof InjectionPoint
  args: any
}

/**
 * @author Abhishek Pathak
 * @param sceneLoader
 * @param entity
 * @param component
 * @param sceneProperty
 */
export const loadRealityPack = async (data: RealityPackNodeArguments) => {
  const moduleEntryPoints = await importPack(data.packName)
  for (const entryPoint of moduleEntryPoints) {
    const loadedSystem = await (await entryPoint).default(useWorld(), data.args)
    const pipeline = data.injectionPoint ?? 'FIXED'
    useWorld().injectedSystems[pipeline].push(loadedSystem)
  }
}
