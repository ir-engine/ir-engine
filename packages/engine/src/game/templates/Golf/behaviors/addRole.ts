import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, getMutableComponent, hasComponent } from "../../../../ecs/functions/EntityFunctions";
import { changeRole, addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { GamePlayer } from "../../../components/GamePlayer";
import { YourTurn } from "../components/YourTurnTagComponent";
import { GamesSchema } from "../../GamesSchema";
import { getGame } from '../../../functions/functions';
/**
 * @author HydraFire <github.com/HydraFire>
 */
function recurseSearchEmptyRole(game, gameSchema, number, allowInOneRole) {
  if (game.gamePlayers[Object.keys(gameSchema.gamePlayerRoles)[number]].length > allowInOneRole - 1) {
    number -= 1;
    return recurseSearchEmptyRole(game, gameSchema, number, 1);
  } else {
    return number;
  }
}
export const addRole: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const game = getGame(entity);
  const gameSchema = GamesSchema[game.gameMode];
  let newPlayerNumber = Object.keys(game.gamePlayers).reduce((acc,v) => acc + game.gamePlayers[v].length, 0);
  // check if role buzy
  newPlayerNumber = recurseSearchEmptyRole(game, gameSchema, newPlayerNumber, 1); //last parameter - allowInOneRole, for futured RedTeam vs BlueTeam
  console.warn('Player Number '+ newPlayerNumber);
  changeRole(entity, Object.keys(gameSchema.gamePlayerRoles)[newPlayerNumber]);
};
