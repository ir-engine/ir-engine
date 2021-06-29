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

export const getPositionNextPoint = ( entity: Entity, args?: any, entityTarget?: Entity ) => {

  let gameScore = null;
  if (hasComponent(entity, GamePlayer)) {
    gameScore = getStorage(entity, { name: 'GameScore' });
  } else if (hasComponent(entityTarget, GamePlayer)) {
    gameScore = getStorage(entityTarget, { name: 'GameScore' });
  }
  
  const game = getGame(entity);
  console.warn(args.positionCopyFromRole+gameScore.score.goal);
  const teeEntity = game.gameObjects[args.positionCopyFromRole+gameScore.score.goal][0];
  if (teeEntity) {
    const teeTransform = getComponent(teeEntity, TransformComponent);
    args.position = teeTransform.position;
    return args;
  }
  args.position = {x: 0, y:0, z: 0};
  return args;
};
