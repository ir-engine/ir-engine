import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState'
import { GamePlayer } from '../../../components/GamePlayer'
import { getGame } from '../../../functions/functions'
import { YourTurn } from '../../gameDefault/components/YourTurnTagComponent'
//import { spawnGolfBall } from './spawnGolfBall';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const applyTurn: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  const game = getGame(entity)
  /*
   Object.keys(game.gamePlayers).forEach(role => {
    const otherPlayerEntity = game.gamePlayers[role].find(entityF => hasComponent(entityF, YourTurn));
    if (otherPlayerEntity) {
      console.warn('applyTurn: removeStateComponent');
      removeStateComponent(otherPlayerEntity, YourTurn);
    }
  });
  console.warn('applyTurn: addStateComponent');
  addStateComponent(entity, YourTurn);
  */
}
