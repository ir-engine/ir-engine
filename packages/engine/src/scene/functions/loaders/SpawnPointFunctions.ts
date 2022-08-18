import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { SpawnPointComponent } from '../../components/SpawnPointComponent'

export const SCENE_COMPONENT_SPAWN_POINT = 'spawn-point'
export const SCENE_COMPONENT_SPAWN_POINT_DEFAULT_VALUES = {}

export const deserializeSpawnPoint: ComponentDeserializeFunction = async (entity: Entity) => {
  addComponent(entity, SpawnPointComponent, true)
}

export const serializeSpawnPoint: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, SpawnPointComponent)) {
    return {
      name: SCENE_COMPONENT_SPAWN_POINT,
      props: {}
    }
  }
}
