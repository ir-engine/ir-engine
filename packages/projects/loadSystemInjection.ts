import type { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import type { SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import type { SystemComponentType } from '@xrengine/engine/src/scene/components/SystemComponent'

export const getSystemsFromSceneData = (
  project: string,
  sceneData: SceneJson,
  isClient: boolean
): SystemModuleType<any>[] => {
  const systems: SystemModuleType<any>[] = []
  for (const entity of Object.values(sceneData.entities)) {
    for (const component of entity.components) {
      if (component.name === 'system') {
        const data: SystemComponentType = component.props
        if ((isClient && data.enableClient) || (!isClient && data.enableServer)) {
          systems.push(importSystem(project, data))
        }
      }
    }
  }
  return systems
}

export const importSystem = (project: string, data: SystemComponentType): SystemModuleType<any> => {
  console.info(`Loading system ${data.filePath} from project ${project}. Data`, data)
  const { filePath, systemUpdateType, args } = data
  const filePathRelative = new URL(filePath).pathname.replace(`/projects/${project}/`, '')
  const entryPointSplit = filePathRelative.split('.')
  const entryPointExtension = entryPointSplit.pop()
  // const entryPointFileName = entryPointSplit.join('.')
  // vite MUST have the extension as part of the string, so unfortunately we have to manually try all potential file paths
  // It also requires that each nested folder be explicitly present in the import string, since each variable is replaced
  // by a single-depth wildcard '*'. In order to go multiple directories deep, there must be explicit slashes for each
  // level it's going down in the string. Annoying, hence the current hackfix of returning successively longer import statements
  // based on the depth of the file.
  // TODO: we could make our own derivate of https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars which can handle this more elegantly
  try {
    const entryPointPathSplit = entryPointSplit[0].split('/')
    let systemModulePromise
    switch (entryPointExtension) {
      case 'js':
        if (entryPointPathSplit.length === 1)
          systemModulePromise = import(`./projects/${project}/${entryPointPathSplit[0]}.js`)
        if (entryPointPathSplit.length === 2)
          systemModulePromise = import(`./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}.js`)
        if (entryPointPathSplit.length === 3)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}.js`
          )
        if (entryPointPathSplit.length === 4)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}.js`
          )
        if (entryPointPathSplit.length === 5)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}/${entryPointPathSplit[4]}.js`
          )
        if (entryPointPathSplit.length === 6)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}/${entryPointPathSplit[4]}/${entryPointPathSplit[5]}.js`
          )
        if (entryPointPathSplit.length > 6)
          systemModulePromise = Promise.reject(
            'Custom systems cannot be located more than five directories down from the root of the project'
          )
        return {
          systemModulePromise: systemModulePromise,
          type: systemUpdateType,
          sceneSystem: true,
          args
        }
      case 'jsx':
        if (entryPointPathSplit.length === 1)
          systemModulePromise = import(`./projects/${project}/${entryPointPathSplit[0]}.jsx`)
        if (entryPointPathSplit.length === 2)
          systemModulePromise = import(`./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}.jsx`)
        if (entryPointPathSplit.length === 3)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}.jsx`
          )
        if (entryPointPathSplit.length === 4)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}.jsx`
          )
        if (entryPointPathSplit.length === 5)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}/${entryPointPathSplit[4]}.jsx`
          )
        if (entryPointPathSplit.length === 6)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}/${entryPointPathSplit[4]}/${entryPointPathSplit[5]}.jsx`
          )
        if (entryPointPathSplit.length > 6)
          systemModulePromise = Promise.reject(
            'Custom systems cannot be located more than five directories down from the root of the project'
          )
        return {
          systemModulePromise: systemModulePromise,
          type: systemUpdateType,
          sceneSystem: true,
          args
        }
      case 'ts':
        if (entryPointPathSplit.length === 1)
          systemModulePromise = import(`./projects/${project}/${entryPointPathSplit[0]}.ts`)
        if (entryPointPathSplit.length === 2)
          systemModulePromise = import(`./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}.ts`)
        if (entryPointPathSplit.length === 3)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}.ts`
          )
        if (entryPointPathSplit.length === 4)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}.ts`
          )
        if (entryPointPathSplit.length === 5)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}/${entryPointPathSplit[4]}.ts`
          )
        if (entryPointPathSplit.length === 6)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}/${entryPointPathSplit[4]}/${entryPointPathSplit[5]}.ts`
          )
        if (entryPointPathSplit.length > 6)
          systemModulePromise = Promise.reject(
            'Custom systems cannot be located more than five directories down from the root of the project'
          )
        return {
          systemModulePromise: systemModulePromise,
          type: systemUpdateType,
          sceneSystem: true,
          args
        }
      case 'tsx':
        if (entryPointPathSplit.length === 1)
          systemModulePromise = import(`./projects/${project}/${entryPointPathSplit[0]}.tsx`)
        if (entryPointPathSplit.length === 2)
          systemModulePromise = import(`./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}.tsx`)
        if (entryPointPathSplit.length === 3)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}.tsx`
          )
        if (entryPointPathSplit.length === 4)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}.tsx`
          )
        if (entryPointPathSplit.length === 5)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}/${entryPointPathSplit[4]}.tsx`
          )
        if (entryPointPathSplit.length === 6)
          systemModulePromise = import(
            `./projects/${project}/${entryPointPathSplit[0]}/${entryPointPathSplit[1]}/${entryPointPathSplit[2]}/${entryPointPathSplit[3]}/${entryPointPathSplit[4]}/${entryPointPathSplit[5]}.tsx`
          )
        if (entryPointPathSplit.length > 6)
          systemModulePromise = Promise.reject(
            'Custom systems cannot be located more than five directories down from the root of the project'
          )
        return {
          systemModulePromise: systemModulePromise,
          type: systemUpdateType,
          sceneSystem: true,
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
