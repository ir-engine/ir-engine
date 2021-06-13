import { Vector3 } from 'three';
import { ControllerColliderComponent } from '../../../../character/components/ControllerColliderComponent';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from "../../../../ecs/functions/EntityFunctions";
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { GamePlayer } from '../../../components/GamePlayer';
import { getGame, getTargetEntity } from '../../../functions/functions';
import { removeStateComponent } from '../../../functions/functionsState';
import { getStorage } from '../../../functions/functionsStorage';
import { State } from '../../../types/GameComponents';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const teleportPlayer: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  console.warn('Teleport Player');
  //const collider = getMutableComponent(entityArg, ColliderComponent)
  const collider = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);

  collider.controller.updateTransform({
    translation: {
      x: args.position.x,
      y: args.position.y,
      z: args.position.z
    },
    rotation: {
      x:0,
      y:0,
      z:0,
      w:1
    },
    linearVelocity: {
      x:0, y:0, z:0
    }
  })

};
