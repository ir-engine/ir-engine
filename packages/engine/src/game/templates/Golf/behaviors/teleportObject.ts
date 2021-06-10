import { Vector3 } from 'three';
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

export const teleportObject: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  console.warn('Teleport Object');

  const entityArg = getTargetEntity(entity, entityTarget, args);
  let gameScore
  if (hasComponent(entity, GamePlayer)) {
    gameScore = getStorage(entity, { name: 'GameScore' });
  } else if (hasComponent(entityTarget, GamePlayer)) {
    gameScore = getStorage(entityTarget, { name: 'GameScore' });
  }
  

  const game = getGame(entityArg);
  console.warn(args.positionCopyFromRole+gameScore.score.goal);
  const teeEntity = game.gameObjects[args.positionCopyFromRole+gameScore.score.goal][0];
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
