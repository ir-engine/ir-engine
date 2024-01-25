/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import config from '@etherealengine/common/src/config'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { SceneJsonType } from '@etherealengine/common/src/schema.type.module'
import { ComponentType } from '@etherealengine/ecs/src/ComponentFunctions'
import { SystemDefinitions, SystemUUID } from '@etherealengine/ecs/src/SystemFunctions'
import { SystemComponent } from '@etherealengine/engine/src/scene/components/SystemComponent'

export type SystemImportType = {
  systemUUID: SystemUUID
  entityUUID: EntityUUID
}

export const getSystemsFromSceneData = (project: string, sceneData: SceneJsonType): Promise<SystemImportType[]> => {
  const systems = [] as ReturnType<typeof importSystem>[]
  for (const [uuid, entity] of Object.entries(sceneData.entities)) {
    for (const component of entity.components) {
      if (component.name === 'system') {
        systems.push(importSystem(project, component.props, uuid as EntityUUID))
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
  const { filePath } = data
  const pathname = filePath.replace(config.client.fileServer!, '')
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

  return { systemUUID, entityUUID }
}
