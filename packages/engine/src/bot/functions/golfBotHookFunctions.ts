import { Vector3 } from 'three'
import { eulerToQuaternion } from '../../common/functions/MathRandomFunctions'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { GamePlayer } from '../../game/components/GamePlayer'
import { getGameFromName } from '../../game/functions/functions'
import { YourTurn } from '../../game/templates/Golf/components/YourTurnTagComponent'
import { Network } from '../../networking/classes/Network'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GolfBotHooks } from '../enums/GolfBotHooks'
import { tweenXRInputSource } from './setupXRBotHooks'

export const GolfBotHookFunctions = {
  [GolfBotHooks.GetBallPosition]: getBallPosition,
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

export function getBallPosition() {
  if (!Network.instance.localClientEntity) return false
  const { gameName, role } = getComponent(Network.instance.localClientEntity, GamePlayer)

  const playerNumber = Number(role.slice(0, 1))

  if (!gameName) return
  const game = getGameFromName(gameName)
  if (!game) {
    console.log('Game not found')
    return
  }
  // TODO: get player number
  const ballEntity = game.gameObjects['GolfBall'][0]
  if (!ballEntity) {
    console.log('ball entity not found for player number', playerNumber, role)
    return
  }
  return getComponent(ballEntity, TransformComponent)?.position
}
