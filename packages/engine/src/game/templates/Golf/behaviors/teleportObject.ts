import { Vector3 } from 'three';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from "../../../../ecs/functions/EntityFunctions";
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { getGame, getTargetEntity } from '../../../functions/functions';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const teleportObject: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  console.warn('Teleport Object');

  const entityArg = getTargetEntity(entity, entityTarget, args);

  const game = getGame(entityArg);
  const teeEntity = game.gameObjects[args.positionCopyFromRole][0];
  const teeTransform = getComponent(teeEntity, TransformComponent);

  const collider = getMutableComponent(entityArg, ColliderComponent)

  collider.velocity.set(0,0,0);

  collider.body.updateTransform({
    translation: {
      x: teeTransform.position.x,
      y: teeTransform.position.y,
      z: teeTransform.position.z
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

  collider.body.setLinearVelocity(new Vector3(), true);
  collider.body.setAngularVelocity(new Vector3(), true);

};
