import type { ProjectPackageInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'

interface ProjectNodeArguments {
  filePath: string
  systemUpdateType: keyof typeof SystemUpdateType
  enableClient: boolean
  enableServer: boolean
  args: any
}

export const getPacksFromSceneData = async (
  sceneData: SceneJson,
  isClient: boolean
): Promise<SystemModuleType<any>[]> => {
  const systems: SystemModuleType<any>[] = []
  for (const entity of Object.values(sceneData.entities)) {
    for (const component of entity.components) {
      if (component.name === 'system') {
        const data: ProjectNodeArguments = component.props
        if ((isClient && data.enableClient) || (!isClient && data.enableServer)) {
          systems.push(await importPack(data))
        }
      }
    }
  }
  return systems
}

export const importPack = async (data: ProjectNodeArguments): Promise<SystemModuleType<any>> => {
  console.info(`Loading Project with data`, data)
  const { filePath, systemUpdateType, args } = data
  const filePathRelative = new URL(filePath).pathname.replace('/projects/', '')
  console.log(filePath)
  const entryPointSplit = filePathRelative.split('.')
  const entryPointExtension = entryPointSplit.pop()
  console.log(filePathRelative, entryPointSplit, entryPointExtension)
  // const entryPointFileName = entryPointSplit.join('.')
  // vite MUST have the extension as part of the string, so unfortunately we have to manually try all potential file paths
  // TODO: we could make our own derivate of https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars which can handle this more elegantly
  try {
    switch (entryPointExtension) {
      case 'js':
        return {
          systemModulePromise: import(`./projects/${entryPointSplit}.js`),
          type: systemUpdateType,
          args
        }
      case 'jsx':
        return {
          systemModulePromise: import(`./projects/${entryPointSplit}.jsx`),
          type: systemUpdateType,
          args
        }
      case 'ts':
        return {
          systemModulePromise: import(`./projects/${entryPointSplit}.ts`),
          type: systemUpdateType,
          args
        }
      case 'tsx':
        return {
          systemModulePromise: import(`./projects/${entryPointSplit}.tsx`),
          type: systemUpdateType,
          args
        }
      default:
        console.error(`[ProjectLoader]: Failed to load project. File type '${entryPointExtension} 'not supported.`)
        break
    }
  } catch (e) {
    console.log('[ProjectLoader]: Failed to load project entry point:', filePath, e)
  }
}
