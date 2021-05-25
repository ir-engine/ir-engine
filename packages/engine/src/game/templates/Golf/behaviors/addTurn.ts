import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, hasComponent } from "../../../../ecs/functions/EntityFunctions";
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { GamePlayer } from "../../../components/GamePlayer";
import { getGame } from '../../../functions/functions';
import { YourTurn } from "../components/YourTurnTagComponent";
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const addTurn: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const game = getGame(entity);
  const noOneTurn = Object.keys(game.gamePlayers).every(role => game.gamePlayers[role].every(entity => !hasComponent(entity, YourTurn)));
  if (noOneTurn) {
    addStateComponent(entity, YourTurn);
  }
};
