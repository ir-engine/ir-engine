import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, hasComponent } from "../../../../ecs/functions/EntityFunctions";
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { GamePlayer } from "../../../components/GamePlayer";
import { YourTurn } from "../components/YourTurnTagComponent";
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const nextTurn: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const game = getComponent(entityTarget, GamePlayer).game;

   Object.keys(game.gamePlayers).some(role => {
    const otherPlayerEntity = game.gamePlayers[role].find(entity => !hasComponent(entity, YourTurn))
    console.warn(otherPlayerEntity);
    if (otherPlayerEntity) {
      removeStateComponent(entityTarget, YourTurn);
      addStateComponent(otherPlayerEntity, YourTurn);
    };
    return otherPlayerEntity ? true : false;
  });

};
