import type { RealityPackInterface } from '@xrengine/common/src/interfaces/RealityPack'
import { SystemModulePromise, SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import type { SceneData } from '@xrengine/engine/src/scene/interfaces/SceneData'

interface RealityPackNodeArguments {
  packName: string
  injectionPoint: keyof typeof SystemUpdateType
  args: any
}

type RealityPackReactComponent = Promise<{ default: (...args: any) => JSX.Element }>

interface RealityPackModules {
  systems: SystemModuleType<any>[]
  react: RealityPackReactComponent[]
}

export const getPacksFromSceneData = async (sceneData: SceneData, isClient: boolean): Promise<RealityPackModules> => {
  const modules = {
    systems: [],
    react: []
  }
  for (const entity of Object.values(sceneData.entities)) {
    for (const component of entity.components) {
      if (component.type === 'realitypack') {
        const data: RealityPackNodeArguments = component.data
        const realityPackModules = await importPack(data.packName, isClient)
        modules.systems.push(
          ...realityPackModules.systems.map((s) => {
            return {
              systemModulePromise: s,
              args: data.args,
              type: data.injectionPoint as keyof typeof SystemUpdateType
            } as SystemModuleType<any>
          })
        )
        modules.react.push(...realityPackModules.react)
      }
    }
  }
  return modules
}

export const importPack = async (packName: string, isClient: boolean) => {
  const modules = {
    systems: [],
    react: []
  }

  try {
    const realityPackManifest = (await import(`./packs/${packName}/manifest.json`)) as RealityPackInterface

    for (const entryPoint of realityPackManifest.moduleEntryPoints) {
      const entryPointSplit = entryPoint.split('.')
      const entryPointExtension = entryPointSplit.pop()
      const entryPointFileName = entryPointSplit.join('')
      // vite MUST have the extension as part of the string, so unfortunately we have to manually try all potential file paths
      // TODO: we could make our own derivate of https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars which can handle this more elegantly
      try {
        switch (entryPointExtension) {
          case 'js':
            modules.systems.push(await import(`./packs/${packName}/${entryPointFileName}.js`))
            break
          case 'ts':
            modules.systems.push(await import(`./packs/${packName}/${entryPointFileName}.ts`))
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

    if (isClient) {
      for (const entryPoint of realityPackManifest.clientReactEntryPoint) {
        const entryPointSplit = entryPoint.split('.')
        const entryPointExtension = entryPointSplit.pop()
        const entryPointFileName = entryPointSplit.join('')
        try {
          switch (entryPointExtension) {
            case 'jsx':
              modules.react.push(await import(`./packs/${packName}/${entryPointFileName}.jsx`))
              break
            case 'tsx':
              modules.react.push(await import(`./packs/${packName}/${entryPointFileName}.tsx`))
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
    }
  } catch (e) {
    console.log(`[RealityPackLoader]: Failed to load reality pack manifest ${packName} with error ${e}`)
  }

  return modules
}
