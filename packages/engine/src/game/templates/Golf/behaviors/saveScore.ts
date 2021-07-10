import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getStorage, setStorage } from '../../../../game/functions/functionsStorage';
import { getTargetEntity } from '../../../../game/functions/functions';

//import { ColliderComponent } from '../../../../physics/components/ColliderComponent';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const saveScore: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const entityArg = getTargetEntity(entity, entityTarget, args);
  console.warn('SAVE Score')
  const gameScore = getStorage(entityArg, { name: 'GameScore' });
  gameScore.score.hits += 1;
  setStorage(entityArg, { name: 'GameScore' }, gameScore);
  console.warn(gameScore);
};


export const initScore: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  setStorage(entity, { name: 'GameScore' }, { score: { hits: 0, goal: 0 }});
};
