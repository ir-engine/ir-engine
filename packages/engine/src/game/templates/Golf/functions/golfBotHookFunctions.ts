import { Vector3 } from 'three'
import { eulerToQuaternion } from '../../../../common/functions/MathRandomFunctions'
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { GamePlayer } from '../../../components/GamePlayer'
import { getGame, getGameFromName } from '../../../functions/functions'
import { getStorage } from '../../../functions/functionsStorage'
import { getPositionNextPoint } from '../behaviors/getPositionNextPoint'
import { Network } from '../../../../networking/classes/Network'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { GolfBotHooks } from './GolfBotHooks'
import { tweenXRInputSource } from '../../../../bot/functions/xrBotHookFunctions'
import { Entity } from '../../../../ecs/classes/Entity'
import { YourTurn } from '../../../types/GameComponents'
import { GolfObjectEntities, GolfState } from '../GolfSystem'
import { NetworkObjectComponent } from '../../../../networking/components/NetworkObjectComponent'
import { getGolfPlayerNumber, isCurrentGolfPlayer } from './golfFunctions'

export const GolfBotHookFunctions = {
  [GolfBotHooks.GetBallPosition]: getBallPosition,
  [GolfBotHooks.GetHolePosition]: getHolePosition,
  [GolfBotHooks.GetTeePosition]: getTeePosition,
  [GolfBotHooks.GetIsPlayerTurn]: getIsPlayerTurn,
  [GolfBotHooks.GetIsGoal]: getIsGoal,
  [GolfBotHooks.GetIsBallStopped]: getIsBallStopped,
  [GolfBotHooks.GetIsOutOfCourse]: getIsOutOfCourse,
  [GolfBotHooks.SwingClub]: swingClub
}

function getOwnBall() {
  if (!Network.instance.localClientEntity) return false
  const { gameName, role } = getComponent(Network.instance.localClientEntity, GamePlayer)
  const playerNumber = Number(role.slice(0, 1))
  if (!gameName) return false
  const game = getGameFromName(gameName)
  if (!game) {
    console.log('Game not found')
    return false
  }
  const ballEntity = game.gameObjects['GolfBall'][playerNumber - 1]
  if (!ballEntity) {
    console.log('ball entity not found for player number', playerNumber, role)
    return
  }
  return ballEntity
}

export function getIsPlayerTurn() {
  if (!Network.instance.localClientEntity) return false
  return isCurrentGolfPlayer(Network.instance.localClientEntity)
}

export function getIsGoal() {
  // if (!Network.instance.localClientEntity) return false
  // return hasComponent(Network.instance.localClientEntity, GolfState.Goal)
}

export function getIsOutOfCourse() {
  // const ballEntity = getOwnBall() as Entity
  // return hasComponent(ballEntity, GolfState.CheckCourse)
}

export function getIsBallStopped() {
  // const ballEntity = getOwnBall() as Entity
  // return hasComponent(ballEntity, GolfState.BallStopped)
}

export function swingClub() {
  return new Promise<void>((resolve) => {
    tweenXRInputSource({
      objectName: 'rightController',
      time: 17,
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
  return getGolfPlayerNumber(Network.instance.localClientEntity)
}

export function getTeePosition() {
  const teeEntity = GolfObjectEntities.get(`GolfTee-${GolfState.currentHole.value}`)
  const teeTransform = getComponent(teeEntity, TransformComponent)
  return teeTransform.position
}

export function getHolePosition() {
  const holeEntity = GolfObjectEntities.get(`GolfHole-${GolfState.currentHole.value}`)
  const holeTransform = getComponent(holeEntity, TransformComponent)
  return holeTransform.position
}

export function getBallPosition() {
  const ballEntity = GolfObjectEntities.get(`GolfBall-${GolfState.currentPlayer.value}`)
  const ballTransform = getComponent(ballEntity, TransformComponent)
  return ballTransform.position
}
