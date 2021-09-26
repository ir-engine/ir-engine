import type { RealityPackInterface } from '@xrengine/common/src/interfaces/RealityPack'
import type { SystemModulePromise } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const importPack = async (packName): Promise<SystemModulePromise<any>[]> => {
  const realityPackManifest = (await import(`./packs/${packName}/manifest.json`)) as RealityPackInterface
  const modules: SystemModulePromise<any>[] = []

  for (const entryPoint of realityPackManifest.moduleEntryPoints) {
    modules.push(import(`./packs/${realityPackManifest.name}/${entryPoint}`))
  }

  return modules
}
