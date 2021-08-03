import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { GameObject } from '../../../../game/components/GameObject'
import { Checker } from '../../../../game/types/Checker'
import { ActiveGames } from '../../../systems/GameManagerSystem'
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const isPlayersInGame: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any | undefined => {
  const gamePlayers = ActiveGames.instance.currentGames.get(getComponent(entity, GameObject).gameName).gamePlayers
  const isPlayersMoreThenZero = Object.keys(gamePlayers).reduce((acc, role) => (acc += gamePlayers[role].length), 0) > 0
  const invert = args?.invert ?? false
  return invert ? !isPlayersMoreThenZero : isPlayersMoreThenZero
}
