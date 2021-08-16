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
import { GolfState } from '../GolfGameComponents'
import { Entity } from '../../../../ecs/classes/Entity'
import { YourTurn } from '../../../types/GameComponents'

export const GolfBotHookFunctions = {
  [GolfBotHooks.GetBallPosition]: getBallPosition,
  [GolfBotHooks.GetHolePosition]: getHolePosition,
  [GolfBotHooks.GetTeePosition]: getTeePosition,
  [GolfBotHooks.GetIsYourTurn]: getIsYourTurn,
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

export function getIsYourTurn() {
  if (!Network.instance.localClientEntity) return false
  return hasComponent(Network.instance.localClientEntity, YourTurn)
}

export function getIsGoal() {
  if (!Network.instance.localClientEntity) return false
  return hasComponent(Network.instance.localClientEntity, GolfState.Goal)
}

export function getIsOutOfCourse() {
  const ballEntity = getOwnBall() as Entity
  return hasComponent(ballEntity, GolfState.CheckCourse)
}

export function getIsBallStopped() {
  const ballEntity = getOwnBall() as Entity
  return hasComponent(ballEntity, GolfState.BallStopped)
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
  const { role } = getComponent(Network.instance.localClientEntity, GamePlayer)
  const playerNumber = Number(role.slice(0, 1))
  return playerNumber
}

export function getTeePosition() {
  const position = getPositionNextPoint(Network.instance.localClientEntity, 'GolfTee-')
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
  const ballEntity = getOwnBall() as Entity
  return getComponent(ballEntity, TransformComponent)?.position
}
