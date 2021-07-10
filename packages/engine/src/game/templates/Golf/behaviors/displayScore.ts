import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getStorage, setStorage } from '../../../../game/functions/functionsStorage';
import { getTargetEntity } from '../../../functions/functions';
import { addStateComponent } from '../../../functions/functionsState';
import { State } from '../../../types/GameComponents';

export const displayScore: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  /*
  const entityArg = getTargetEntity(entity, entityTarget, args);

  const gameScore = getStorage(entityArg, { name: 'GameScore' });
  gameScore.score.goal += 1;
  setStorage(entityArg, { name: 'GameScore' }, Object.keys(gameScore));

  console.warn('/////////////////////////////////////')
  console.warn('/// SCORE // Hits: '+gameScore.score.hits+' // Goal: '+gameScore.score.goal+' ////////');
  console.warn('/////////////////////////////////////')
*/
};

export const saveGoalScore: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const gameScore = getStorage(entity, { name: 'GameScore' });
  gameScore.score.goal += 1;
  setStorage(entity, { name: 'GameScore' }, gameScore);

  console.warn('/////////////////////////////////////')
  console.warn('/// SCORE // Hits: '+gameScore.score.hits+' // Goal: '+gameScore.score.goal+' ////////');
  console.warn('/////////////////////////////////////')
};