import type { ProjectInterface } from '@xrengine/common/src/interfaces/Project'
import { SystemModulePromise, SystemModuleType } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import type { SceneData } from '@xrengine/common/src/interfaces/SceneData'

interface ProjectNodeArguments {
  packName: string
  entryPoints: {
    systemUpdateType: keyof typeof SystemUpdateType
    entryPoint: string
    args: any
  }[]
}

type ProjectReactComponent = Promise<{ default: (...args: any) => JSX.Element }>

interface ProjectModules {
  systems: SystemModuleType<any>[]
  react: ProjectReactComponent[]
}

export const getPacksFromSceneData = async (sceneData: SceneData, isClient: boolean): Promise<ProjectModules> => {
  const modules = {
    systems: [],
    react: []
  }
  for (const entity of Object.values(sceneData.entities)) {
    for (const component of entity.components) {
      if (component.type === 'project') {
        const data: ProjectNodeArguments = component.data
        const projectModules = await importPack(data, isClient)
        modules.systems.push(...projectModules.systems)
        modules.react.push(...projectModules.react)
      }
    }
  }
  return modules
}

export const importPack = async (data: ProjectNodeArguments, isClient: boolean): Promise<ProjectModules> => {
  console.info(`Loading Project with data`, data)
  const modules = {
    systems: [],
    react: []
  }
  try {
    const projectManifest = (await import(`./projects/${data.packName}/manifest.json`)) as ProjectInterface

    console.info(`Got Project Manifest`, projectManifest)

    for (const { entryPoint, systemUpdateType, args } of data.entryPoints) {
      const entryPointSplit = entryPoint.split('.')
      const entryPointExtension = entryPointSplit.pop()
      const entryPointFileName = entryPointSplit.join('.')
      // vite MUST have the extension as part of the string, so unfortunately we have to manually try all potential file paths
      // TODO: we could make our own derivate of https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars which can handle this more elegantly
      try {
        switch (entryPointExtension) {
          case 'js':
            modules.systems.push({
              systemModulePromise: await import(`./projects/${data.packName}/${entryPointFileName}.js`),
              type: systemUpdateType,
              args
            })
            break
          case 'ts':
            modules.systems.push({
              systemModulePromise: await import(`./projects/${data.packName}/${entryPointFileName}.ts`),
              type: systemUpdateType,
              args
            })
            break
          default:
            console.error(`[ProjectLoader]: Failed to load project. File type '${entryPointExtension} 'not supported.`)
            break
        }
      } catch (e) {
        console.log('[ProjectLoader]: Failed to load project entry point:', entryPoint, e)
      }
    }

    if (isClient) {
      for (const entryPoint of projectManifest.clientReactEntryPoint) {
        const entryPointSplit = entryPoint.split('.')
        const entryPointExtension = entryPointSplit.pop()
        const entryPointFileName = entryPointSplit.join('.')
        try {
          switch (entryPointExtension) {
            case 'jsx':
              modules.react.push(import(`./projects/${data.packName}/${entryPointFileName}.jsx`))
              break
            case 'tsx':
              modules.react.push(import(`./projects/${data.packName}/${entryPointFileName}.tsx`))
              break
            default:
              console.error(
                `[ProjectLoader]: Failed to load project. File type '${entryPointExtension} 'not supported.`
              )
              break
          }
        } catch (e) {
          console.log('[ProjectLoader]: Failed to load project entry point:', entryPoint, e)
        }
      }
    }
  } catch (e) {
    console.log(`[ProjectLoader]: Failed to load project manifest ${data} with error ${e}`)
  }

  return modules
}
