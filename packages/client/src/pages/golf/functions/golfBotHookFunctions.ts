import { Vector3 } from 'three'
import { eulerToQuaternion } from '@xrengine/engine/src/common/functions/MathRandomFunctions'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { GolfBotHooks } from './GolfBotHooks'
import { tweenXRInputSource, updateController, updateHead } from '@xrengine/engine/src/bot/functions/xrBotHookFunctions'
import { GolfObjectEntities, GolfState } from '../GolfSystem'
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
      time: 20,
      positionFrom: new Vector3(0.5, 1, 0.04),
      positionTo: new Vector3(-0.5, 1, 0.04),
      quaternionFrom: eulerToQuaternion(-1.54, 0, 0),
      quaternionTo: eulerToQuaternion(-1.54, 0, 0),
      callback: () => {
        updateController({
          objectName: 'rightController',
          position: new Vector3(0.5, 1, 0.04).toArray(),
          rotation: eulerToQuaternion(-1.54, 0, 0).toArray()
        })
        setTimeout(resolve, 500)
      }
    })
  })
}

export function getPlayerNumber() {
  if (!Network.instance.localClientEntity) return
  return getGolfPlayerNumber(Network.instance.localClientEntity)
}

export function getTeePosition() {
  const teeEntity = GolfObjectEntities.get(`golftee-${GolfState.currentHole.value}`)
  const teeTransform = getComponent(teeEntity, TransformComponent)
  return teeTransform.position
}

export function getHolePosition() {
  const holeEntity = GolfObjectEntities.get(`golfhole-${GolfState.currentHole.value}`)
  const holeTransform = getComponent(holeEntity, TransformComponent)
  return holeTransform.position
}

export function getBallPosition() {
  const ballEntity = GolfObjectEntities.get(`golfball-${GolfState.currentPlayer.value}`)
  const ballTransform = getComponent(ballEntity, TransformComponent)
  return ballTransform.position
}
