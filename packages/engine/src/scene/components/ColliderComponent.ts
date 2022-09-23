import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'

export type ColliderComponentType = {
  bodyType: RigidBodyType
  shapeType: ShapeType
  isTrigger: boolean
  /**
   * removeMesh will clean up any objects in the scene hierarchy after the collider bodies have been processed.
   *   This can be used to reduce CPU load by only persisting colliders in the physics simulation.
   */
  removeMesh: boolean
  collisionLayer: number
  collisionMask: number
  /**
   * trigger component values
   */
  triggerEvent: string
  triggerType: string
  target: any
  active: boolean
  targetComponent: string
}

export const ColliderComponent = createMappedComponent<ColliderComponentType>('ColliderComponent')

export const SCENE_COMPONENT_COLLIDER = 'collider'
export const SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES = {
  bodyType: RigidBodyType.Fixed,
  shapeType: ShapeType.Cuboid,
  isTrigger: false,
  removeMesh: false,
  collisionLayer: CollisionGroups.Default,
  collisionMask: DefaultCollisionMask,

  triggerEvent: '',
  triggerType: '',
  target: '',
  active: true,
  targetComponent: ''
}
