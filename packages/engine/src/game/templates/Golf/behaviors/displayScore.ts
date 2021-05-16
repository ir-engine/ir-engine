import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { getStorage, setStorage } from '../../../../game/functions/functionsStorage';

/**
 * @author HydraFire <github.com/HydraFire>
 */

function getTargetEntity(entity, entityTarget, args) {
  return args.on === 'target' ? entityTarget : entity;
  //console.warn('giveOpenOrCloseState, you must give argument on: me, or on: target');
}

export const displayScore: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const entityArg = getTargetEntity(entity, entityTarget, args);

  const gameScore = getStorage(entityArg, { name: 'GameScore' });
  gameScore.score.goal += 1;
  setStorage(entityArg, { name: 'GameScore' }, Object.keys(gameScore));

  console.warn('/////////////////////////////////////')
  console.warn('/// SCORE // Hits: '+gameScore.score.hits+' // Goal: '+gameScore.score.goal+' ////////');
  console.warn('/////////////////////////////////////')

};
