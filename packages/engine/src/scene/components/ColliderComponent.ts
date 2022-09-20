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
   * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
   */
  onEnter?: string
  /**
   * The function to call on the CallbackComponent of the targetEntity when the trigger volume is exited.
   */
  onExit?: string
  /**
   * uuid (string)
   *
   * empty string represents self
   *
   * TODO: how do we handle non-scene entities?
   */
  target?: string
}

export const ColliderComponent = createMappedComponent<ColliderComponentType>('ColliderComponent')

export const SCENE_COMPONENT_COLLIDER = 'collider'
export const SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES = {
  bodyType: RigidBodyType.Fixed,
  shapeType: ShapeType.Cuboid,
  isTrigger: false,
  removeMesh: false,
  collisionLayer: CollisionGroups.Default,
  collisionMask: DefaultCollisionMask
}
