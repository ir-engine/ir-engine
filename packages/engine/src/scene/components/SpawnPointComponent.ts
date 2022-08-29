import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type SpawnPointComponentType = {
  permissionedUsers: UserId[]
}

export const SpawnPointComponent = createMappedComponent<SpawnPointComponentType>('SpawnPointComponent')

export const SCENE_COMPONENT_SPAWN_POINT = 'spawn-point'
export const SCENE_COMPONENT_SPAWN_POINT_DEFAULT_DATA = {
  permissionedUsers: []
}
