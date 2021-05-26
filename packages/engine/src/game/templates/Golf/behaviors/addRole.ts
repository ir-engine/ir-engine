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

export const addRole: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const game = getGame(entity);
  const gameSchema = GamesSchema[game.gameMode];
  const newPlayerNumber = Object.keys(game.gamePlayers).reduce((acc,v) => acc + game.gamePlayers[v].length, 0);
  changeRole(entity, Object.keys(gameSchema.gamePlayerRoles)[newPlayerNumber]);
};
