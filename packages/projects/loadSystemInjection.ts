import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import type { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { isClient } from '@etherealengine/engine/src/common/functions/getEnvironment'
import { ComponentType } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SystemDefinitions, SystemUUID } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import {
  convertSystemComponentJSON,
  SystemComponent
} from '@etherealengine/engine/src/scene/components/SystemComponent'

export type SystemImportType = {
  systemUUID: SystemUUID
  insertUUID: SystemUUID
  insertOrder: 'before' | 'with' | 'after'
  args: Record<any, any>
  entityUUID: EntityUUID
}

export const getSystemsFromSceneData = (project: string, sceneData: SceneJson): Promise<SystemImportType[]> => {
  const systems = [] as ReturnType<typeof importSystem>[]
  for (const [uuid, entity] of Object.entries(sceneData.entities)) {
    for (const component of entity.components) {
      if (component.name === 'system') {
        const data = convertSystemComponentJSON(component.props)
        if ((isClient && data.enableClient) || (!isClient && data.enableServer)) {
          systems.push(importSystem(project, data, uuid as EntityUUID))
        }
      }
    }
  }
  return Promise.all(systems)
}

export const importSystem = async (
  project: string,
  data: ComponentType<typeof SystemComponent>,
  entityUUID: EntityUUID
) => {
  console.info(`Getting system definition at ${data.filePath} from project ${project}`, data)
  const { filePath, insertUUID, insertOrder, args } = data
  const pathname = new URL(filePath).pathname
  const filePathRelative = pathname.replace(`/projects/${project}/src/systems/`, '')
  if (filePathRelative === pathname) {
    console.error(`[ProjectLoader]: File extension MUST end with '*System.ts', got ${filePathRelative} instead`)
    return null!
  }
  const module = await import(`./projects/${project}/src/systems/${filePathRelative.replace('System.ts', '')}System.ts`)
  const systemUUID = module.default as SystemUUID

  if (!systemUUID) {
    console.error(`[ProjectLoader]: System not found at ${filePathRelative}`)
    return null!
  }

  const system = SystemDefinitions.get(systemUUID)
  if (!system) {
    console.error(`[ProjectLoader]: System not found at ${filePathRelative}`)
    return null!
  }
  system.sceneSystem = true

  return { systemUUID, insertUUID, insertOrder, args, entityUUID }
}
