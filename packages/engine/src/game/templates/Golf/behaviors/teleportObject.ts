import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, hasComponent } from "../../../../ecs/functions/EntityFunctions";
import { getStorage, setStorage } from '../../../../game/functions/functionsStorage';
import { getTargetEntity } from '../../../../game/functions/functions';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const teleportObject: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {


  const collider = getComponent(entity, ColliderComponent)
  const position = getComponent(entityTarget, TransformComponent).position
  //console.warn(collider);
  //console.warn(transform);

  collider.body.updateTransform({
    translation: {
      x: position.x,
      y: position.y,
      z: position.z
    },
    rotation: {}
  })

};
