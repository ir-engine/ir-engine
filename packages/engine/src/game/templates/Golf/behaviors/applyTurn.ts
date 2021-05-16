import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, hasComponent } from "../../../../ecs/functions/EntityFunctions";
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { GamePlayer } from "../../../components/GamePlayer";
import { YourTurn } from "../components/YourTurnTagComponent";
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const applyTurn: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const game = getComponent(entity, GamePlayer).game;

   Object.keys(game.gamePlayers).forEach(role => {
    const otherPlayerEntity = game.gamePlayers[role].find(entityF => hasComponent(entityF, YourTurn));
    if (otherPlayerEntity) {
      console.warn('removeStateComponent');
      removeStateComponent(otherPlayerEntity, YourTurn);
    }
  });

  addStateComponent(entity, YourTurn);
};
