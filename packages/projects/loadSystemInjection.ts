import type { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { isClient } from '@etherealengine/engine/src/common/functions/isClient'
import type { SystemModuleType } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import type { SystemComponentType } from '@etherealengine/engine/src/scene/components/SystemComponent'

export const getSystemsFromSceneData = (project: string, sceneData: SceneJson): SystemModuleType<any>[] => {
  const systems: SystemModuleType<any>[] = []
  for (const [uuid, entity] of Object.entries(sceneData.entities)) {
    for (const component of entity.components) {
      if (component.name === 'system') {
        const data: SystemComponentType = component.props
        if ((isClient && data.enableClient) || (!isClient && data.enableServer)) {
          systems.push({ ...importSystem(project, data), uuid })
        }
      }
    }
  }
  return systems
}

export const importSystem = (project: string, data: SystemComponentType): Omit<SystemModuleType<any>, 'uuid'> => {
  console.info(`Getting system definition at ${data.filePath} from project ${project}`, data)
  const { filePath, systemUpdateType, args } = data
  const pathname = new URL(filePath).pathname
  const filePathRelative = pathname.replace(`/projects/${project}/src/systems/`, '')
  if (filePathRelative === pathname) {
    console.error(`[ProjectLoader]: File extension MUST end with '*System.ts', got ${filePathRelative} instead`)
    return null!
  }
  return {
    systemLoader: () =>
      import(`./projects/${project}/src/systems/${filePathRelative.replace('System.ts', '')}System.ts`)!,
    type: systemUpdateType,
    sceneSystem: true,
    args
  }
}
