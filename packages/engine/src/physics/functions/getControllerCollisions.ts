import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Entity } from '../../ecs/classes/Entity'
import { ComponentConstructor, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { ControllerHitEvent, ControllerObstacleHitEvent } from '../../physics/types/PhysicsTypes'
import { CollisionComponent } from '../components/CollisionComponent'

type ControllerCollisionHit = {
  controllerCollisionEvent: ControllerHitEvent | ControllerObstacleHitEvent
  controllerCollisionEntity: Entity
}

export const getControllerCollisions = (
  entity: Entity,
  component: ComponentConstructor<any, any>
): ControllerCollisionHit => {
  const controller = getComponent(entity, AvatarControllerComponent)
  const collisions = getComponent(entity, CollisionComponent)
  if (controller && collisions) {
    for (const controllerCollisionEvent of collisions.collisions as (
      | ControllerHitEvent
      | ControllerObstacleHitEvent
    )[]) {
      if (typeof (controllerCollisionEvent as ControllerHitEvent).body !== 'undefined') {
        const controllerCollisionEntity = (controllerCollisionEvent as ControllerHitEvent).body.userData.entity
        if (hasComponent(controllerCollisionEntity, component)) {
          return {
            controllerCollisionEvent,
            controllerCollisionEntity
          }
        }
      }
      // TODO: implement obstacles
      // else if(typeof (controllerCollisionEvent as ControllerObstacleHitEvent).obstacle !== 'undefined') { }
    }
  }

  return {
    controllerCollisionEvent: undefined,
    controllerCollisionEntity: undefined
  } as any
}
