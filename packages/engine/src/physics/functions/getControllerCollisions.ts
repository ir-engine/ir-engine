import { ColliderHitEvent, ControllerHitEvent, ControllerObstacleHitEvent } from 'three-physx'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Entity } from '../../ecs/classes/Entity'
import { ComponentConstructor, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../components/ColliderComponent'

type ControllerCollisionHit = {
  controllerCollisionEvent: ControllerHitEvent | ControllerObstacleHitEvent
  controllerCollisionEntity: Entity
}

export const getControllerCollisions = (
  entity: Entity,
  component: ComponentConstructor<any, any>
): ControllerCollisionHit => {
  const controller = getComponent(entity, AvatarControllerComponent)
  if (controller) {
    for (const controllerCollisionEvent of controller.controller.controllerCollisionEvents) {
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
  }
}
