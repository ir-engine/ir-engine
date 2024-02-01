import { ShapeType } from '@dimforge/rapier3d-compat'
import { defineComponent } from '@etherealengine/ecs'
import { CollisionGroups, DefaultCollisionMask } from '../enums/CollisionGroups'

export const ColliderComponent = defineComponent({
  name: 'ColliderComponent',
  jsonID: 'ee_collider',

  onInit(entity) {
    return {
      shapeType: ShapeType.Cuboid,
      collisionLayer: CollisionGroups.Default,
      collisionMask: DefaultCollisionMask,
      restitution: 0.5
    }
  }
})
