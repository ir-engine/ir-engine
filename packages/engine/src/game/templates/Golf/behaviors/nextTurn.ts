import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { getGame, getGameFromName } from '../../../../game/functions/functions'
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState'
import { GamePlayer } from '../../../components/GamePlayer'
import { State } from '../../../types/GameComponents'

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const nextTurn = (entity: Entity): void => {
  const game = getGame(entity) ?? getGameFromName(getComponent(entity, GamePlayer, true).gameName)
  const arrPlayersInGame = Object.keys(game.gamePlayers).filter(
    (role) => game.gamePlayers[role].length && role != 'newPlayer'
  )

  if (arrPlayersInGame.length < 2) {
    if (hasComponent(entity, State.WaitTurn)) {
      removeStateComponent(entity, State.WaitTurn)
      addStateComponent(entity, State.YourTurn)
      return
    }
    if (hasComponent(entity, State.Waiting)) {
      removeStateComponent(entity, State.Waiting)
      addStateComponent(entity, State.YourTurn)
      return
    }
  }

  const whoseRoleTurnNow = getComponent(entity, GamePlayer, true).role //arrPlayersInGame.filter(role => hasComponent(game.gamePlayers[role][0], State.Waiting))[0];
  const roleNumber = parseFloat(whoseRoleTurnNow[0])
  console.log('roleNumber ', roleNumber)
  if (hasComponent(entity, GamePlayer)) {
    removeStateComponent(entity, State.Waiting)
    addStateComponent(entity, State.WaitTurn)
  }

  const sortedRoleNumbers = arrPlayersInGame.map((v) => parseFloat(v[0])).sort((a, b) => b - a)

  const lastNumber = sortedRoleNumbers[0]
  console.log('lastNumber ', lastNumber)
  let chooseNumber = null
  if (roleNumber === lastNumber) {
    chooseNumber = sortedRoleNumbers[sortedRoleNumbers.length - 1]
  } else {
    chooseNumber = sortedRoleNumbers[sortedRoleNumbers.findIndex((f) => f === roleNumber) - 1]
  }
  console.log('chooseNumber ', chooseNumber)
  const roleFullName = arrPlayersInGame.filter((role) => parseFloat(role[0]) === chooseNumber)[0]
  if (game.gamePlayers[roleFullName] === undefined) return
  const entityP = game.gamePlayers[roleFullName][0]

  if (!hasComponent(entityP, State.WaitTurn)) {
    console.warn('try to give turn to ' + roleFullName + ', but he dont have WaitTurn State')
    return
  }
  // do not create ctions from game behaviors
  removeStateComponent(entityP, State.WaitTurn)
  addStateComponent(entityP, State.YourTurn)
  console.warn('NEXT TURN ' + roleFullName)
}
