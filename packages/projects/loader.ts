import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'

interface SystemProps {
  filePath: string
  systemUpdateType: keyof typeof SystemUpdateType
  enableClient: boolean
  enableServer: boolean
  args: any
}

export const getSystemsFromSceneData = async (
  project: string,
  sceneData: SceneJson,
  isClient: boolean
): Promise<SystemModuleType<any>[]> => {
  const systems: SystemModuleType<any>[] = []
  for (const entity of Object.values(sceneData.entities)) {
    for (const component of entity.components) {
      if (component.name === 'system') {
        const data: SystemProps = component.props
        if ((isClient && data.enableClient) || (!isClient && data.enableServer)) {
          systems.push(await importSystem(project, data))
        }
      }
    }
  }
  return systems
}

export const importSystem = async (project: string, data: SystemProps): Promise<SystemModuleType<any>> => {
  console.info(`Loading Project ${project} with data`, data)
  const { filePath, systemUpdateType, args } = data
  const filePathRelative = new URL(filePath).pathname.replace(`/projects/${project}/`, '')
  const entryPointSplit = filePathRelative.split('.')
  const entryPointExtension = entryPointSplit.pop()
  // const entryPointFileName = entryPointSplit.join('.')
  // vite MUST have the extension as part of the string, so unfortunately we have to manually try all potential file paths
  // TODO: we could make our own derivate of https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars which can handle this more elegantly
  try {
    switch (entryPointExtension) {
      case 'js':
        return {
          systemModulePromise: import(`./projects/${project}/${entryPointSplit}.js`),
          type: systemUpdateType,
          args
        }
      case 'jsx':
        return {
          systemModulePromise: import(`./projects/${project}/${entryPointSplit}.jsx`),
          type: systemUpdateType,
          args
        }
      case 'ts':
        return {
          systemModulePromise: import(`./projects/${project}/${entryPointSplit}.ts`),
          type: systemUpdateType,
          args
        }
      case 'tsx':
        return {
          systemModulePromise: import(`./projects/${project}/${entryPointSplit}.tsx`),
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
  return null!
}
