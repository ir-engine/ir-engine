import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'

export const BoxColliderComponent = createMappedComponent<true>('BoxColliderComponent')

export const SCENE_COMPONENT_BOX_COLLIDER = 'box-collider'
export const SCENE_COMPONENT_BOX_COLLIDER_DEFAULT_VALUES = {
  isTrigger: false,
  removeMesh: false,
  collisionLayer: CollisionGroups.Default,
  collisionMask: DefaultCollisionMask
}
