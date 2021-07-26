import { Vector3 } from 'three'
import { eulerToQuaternion } from '../../common/functions/MathRandomFunctions'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { GamePlayer } from '../../game/components/GamePlayer'
import { getGame, getGameFromName } from '../../game/functions/functions'
import { getStorage } from '../../game/functions/functionsStorage'
import { getPositionNextPoint } from '../../game/templates/Golf/behaviors/getPositionNextPoint'
import { YourTurn } from '../../game/templates/Golf/components/YourTurnTagComponent'
import { Network } from '../../networking/classes/Network'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GolfBotHooks } from '../enums/GolfBotHooks'
import { tweenXRInputSource } from './xrBotHookFunctions'

export const GolfBotHookFunctions = {
  [GolfBotHooks.GetBallPosition]: getBallPosition,
  [GolfBotHooks.GetHolePosition]: getHolePosition,
  [GolfBotHooks.GetTeePosition]: getTeePosition,
  [GolfBotHooks.GetIsYourTurn]: getIsYourTurn,
  [GolfBotHooks.SwingClub]: swingClub
}

export function getIsYourTurn() {
  if (!Network.instance.localClientEntity) return false
  return hasComponent(Network.instance.localClientEntity, YourTurn)
}

export function swingClub() {
  return new Promise<void>((resolve) => {
    tweenXRInputSource({
      objectName: 'rightController',
      time: 10,
      positionFrom: new Vector3(0.5, 1, 0.04),
      positionTo: new Vector3(-0.5, 1, 0.04),
      quaternionFrom: eulerToQuaternion(-1.54, 0, 0),
      quaternionTo: eulerToQuaternion(-1.54, 0, 0),
      callback: resolve
    })
  })
}

export function getPlayerNumber() {
  if (!Network.instance.localClientEntity) return
  const { role } = getComponent(Network.instance.localClientEntity, GamePlayer)
  const playerNumber = Number(role.slice(0, 1))
  return playerNumber
}

export function getTeePosition() {
  const { position } = getPositionNextPoint(Network.instance.localClientEntity, { positionCopyFromRole: 'GolfTee-' })
  console.log(position)
  return position
}

export function getHolePosition() {
  const gameScore = getStorage(Network.instance.localClientEntity, { name: 'GameScore' })
  const game = getGame(Network.instance.localClientEntity)
  const currentHoleEntity = gameScore.score
    ? game.gameObjects['GolfHole'][gameScore.score.goal]
    : game.gameObjects['GolfHole'][0]
  return getComponent(currentHoleEntity, TransformComponent)?.position
}

export function getBallPosition() {
  const { gameName, role } = getComponent(Network.instance.localClientEntity, GamePlayer)
  const playerNumber = Number(role.slice(0, 1))

  if (!gameName) return
  const game = getGameFromName(gameName)
  if (!game) {
    console.log('Game not found')
    return
  }
  const ballEntity = game.gameObjects['GolfBall'][playerNumber - 1]
  if (!ballEntity) {
    console.log('ball entity not found for player number', playerNumber, role)
    return
  }
  return getComponent(ballEntity, TransformComponent)?.position
}
