import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const SpawnPointComponent = createMappedComponent<true>('SpawnPointComponent')

export const SCENE_COMPONENT_SPAWN_POINT = 'spawn-point'
