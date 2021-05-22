import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, hasComponent } from "../../../../ecs/functions/EntityFunctions";
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { addActionComponent } from '../../../functions/functionsActions';
import { getGame } from '../../../../game/functions/functions';
import { GamePlayer } from "../../../components/GamePlayer";
import { YourTurn } from "../components/YourTurnTagComponent";
import { isServer } from '../../../../common/functions/isServer';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const nextTurn: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  console.warn('NEXT TURN');
  const game = getGame(entity);
  const arrPlayersInGame = Object.keys(game.gamePlayers).filter(role => game.gamePlayers[role].length);
  if (arrPlayersInGame.length < 2) return;

  const whoseRoleTurnNow = arrPlayersInGame.filter(role => hasComponent(game.gamePlayers[role][0], YourTurn))[0];
  const roleNumber = parseFloat(whoseRoleTurnNow[0]);
  console.warn('remove TURN');
  removeStateComponent(game.gamePlayers[whoseRoleTurnNow][0], YourTurn);

  const sortedRoleNumbers = arrPlayersInGame.map(v => parseFloat(v[0])).sort((a,b) => b - a);
  const lastNumber = sortedRoleNumbers[0];

  let chooseNumber = null;
  if (roleNumber === lastNumber) {
   chooseNumber = sortedRoleNumbers[sortedRoleNumbers.length-1];
  } else {
   chooseNumber = sortedRoleNumbers.findIndex(f => f === roleNumber)+1;
  }

  const roleFullName = arrPlayersInGame.filter(role => parseFloat(role[0]) === chooseNumber)[0];
  const entityP = game.gamePlayers[roleFullName][0];
  // do not create ctions from game behaviors
  addStateComponent(entityP, YourTurn);

};
