import { Quaternion } from 'three'
import { teleportPlayer } from '../../../../character/prefabs/NetworkPlayerCharacter'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { Input } from '../../../../input/components/Input'
import { GamepadButtons } from '../../../../input/enums/InputEnums'
import { NetworkObject } from '../../../../networking/components/NetworkObject'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { GamePlayer } from '../../../components/GamePlayer'
import { getGameFromName } from '../../../functions/functions'

// we need to figure out a better way than polluting an 8 bit namespace :/
export enum GolfInput {
  TELEPORT = 120
}

export const setupPlayerInput = (entityPlayer: Entity) => {
  const inputs = getComponent(entityPlayer, Input)

  // override the default mapping and behavior of input schema and interact
  inputs.schema.inputMap.set('k', GolfInput.TELEPORT)
  inputs.schema.inputMap.set(GamepadButtons.A, GolfInput.TELEPORT)
  inputs.schema.inputButtonBehaviors[GolfInput.TELEPORT] = {
    started: [
      {
        behavior: (entity: Entity) => {
          const { gameName, uuid } = getComponent(entity, GamePlayer)
          const game = getGameFromName(gameName)
          const ballEntity = game.gameObjects['GolfBall'].find((e) => getComponent(e, NetworkObject)?.ownerId === uuid)
          const ballTransform = getComponent(ballEntity, TransformComponent)
          const position = ballTransform.position
          console.log('teleporting to', position)
          teleportPlayer(entity, position, new Quaternion())
        }
      }
    ]
  }
}
