import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, getMutableComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { changeRole } from '../../../../game/functions/functionsState'
import { GamePlayer } from '../../../components/GamePlayer'
import { YourTurn } from '../components/YourTurnTagComponent'
import { GamesSchema } from '../../GamesSchema'
import { getGame } from '../../../functions/functions'
import { Game } from '../../../components/Game'
import { GameMode } from '../../../types/GameMode'
/**
 * @author HydraFire <github.com/HydraFire>
 */
function recurseSearchEmptyRole(game: Game, gameSchema: GameMode, newPlayerNumber: number, allowInOneRole: number = 1) {
  if (newPlayerNumber < 1) {
    return null
  } else if (
    game.gamePlayers[gameSchema.gamePlayerRoles[newPlayerNumber]] === undefined ||
    game.gamePlayers[gameSchema.gamePlayerRoles[newPlayerNumber]].length > allowInOneRole - 1
  ) {
    newPlayerNumber -= 1
    return recurseSearchEmptyRole(game, gameSchema, newPlayerNumber, 1)
  } else {
    return newPlayerNumber
  }
}

export const addRole: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  const game = getGame(entity)
  const gameSchema = GamesSchema[game.gameMode] as GameMode
  let newPlayerNumber = Object.keys(game.gamePlayers).reduce((acc, v) => acc + game.gamePlayers[v].length, 0)
  console.log(game.gamePlayers)
  console.log('newPlayerNumber', newPlayerNumber)
  console.log(gameSchema.gamePlayerRoles)
  // TODO: this doesnt work
  // newPlayerNumber = recurseSearchEmptyRole(game, gameSchema, newPlayerNumber) //last parameter - allowInOneRole, for futured RedTeam vs BlueTeam

  if (newPlayerNumber === null || newPlayerNumber > game.maxPlayers) {
    console.warn(
      'Player ' + newPlayerNumber + ' cant join game, because game set with maxPlayer count:' + game.maxPlayers
    )
    return
  }
  changeRole(entity, gameSchema.gamePlayerRoles[newPlayerNumber])
}
