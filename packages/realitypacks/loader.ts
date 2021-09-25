import type { RealityPack } from '@xrengine/common/src/interfaces/RealityPack'
import type { SystemModulePromise } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const importPack = async (packName): Promise<SystemModulePromise<any>[]> => {
  const json = (await import(`./packs/${packName}/manifest.json`)) as RealityPack
  const modules: SystemModulePromise<any>[] = []

  for (const entryPoint of json.moduleEntryPoints) {
    const { default: RealityPackSystem } = await import(`./packs/${entryPoint}`)
    modules.push(RealityPackSystem)
  }

  return modules
}
