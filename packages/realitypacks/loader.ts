import type { RealityPackInterface } from '@xrengine/common/src/interfaces/RealityPack'
import type { SystemModulePromise } from '@xrengine/engine/src/ecs/functions/SystemFunctions'

export const importPack = async (packName): Promise<SystemModulePromise<any>[]> => {
  const realityPackManifest = (await import(`./packs/${packName}/manifest.json`)) as RealityPackInterface
  const modules: SystemModulePromise<any>[] = []

  for (const entryPoint of realityPackManifest.moduleEntryPoints) {
    const entryPointSplit = entryPoint.split('.')
    const entryPointExtension = entryPointSplit.pop()
    const entryPointFileName = entryPointSplit.join('')
    // vite MUST have the extension as part of the string, so unfortunately we have to manually try all potential file paths
    // TODO: we could make our own derivate of https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars which can handle this more elegantly
    try {
      switch (entryPointExtension) {
        case 'js':
          modules.push(await import(`./packs/${packName}/${entryPointFileName}.js`))
          break
        case 'jsx':
          modules.push(await import(`./packs/${packName}/${entryPointFileName}.jsx`))
          break
        case 'ts':
          modules.push(await import(`./packs/${packName}/${entryPointFileName}.ts`))
          break
        case 'tsx':
          modules.push(await import(`./packs/${packName}/${entryPointFileName}.tsx`))
          break
        default:
          console.error(
            `[RealityPackLoader]: Failed to load reality pack. File type '${entryPointExtension} 'not supported.`
          )
          break
      }
    } catch (e) {
      console.log('[RealityPackLoader]: Failed to load reality pack entry point:', entryPoint, e)
    }
  }

  return modules
}
