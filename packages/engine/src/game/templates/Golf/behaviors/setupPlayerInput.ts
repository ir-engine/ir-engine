import { Quaternion, Vector3 } from 'three'
import { teleportPlayer } from '../../../../character/prefabs/NetworkPlayerCharacter'
import { isDev } from '../../../../common/functions/isDev'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { Input } from '../../../../input/components/Input'
import { GamepadButtons } from '../../../../input/enums/InputEnums'
import { NetworkObject } from '../../../../networking/components/NetworkObject'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { GamePlayer } from '../../../components/GamePlayer'
import { getGameFromName } from '../../../functions/functions'
import { addStateComponent } from '../../../functions/functionsState'
import { getStorage } from '../../../functions/functionsStorage'
import { State } from '../../../types/GameComponents'
import { teleportObject } from './teleportObject'

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
          const { gameName, ownedObjects } = getComponent(entity, GamePlayer)
          const game = getGameFromName(gameName)
          const ballEntity = ownedObjects['GolfBall']
          const ballTransform = getComponent(ballEntity, TransformComponent)
          const position = ballTransform.position
          console.log('teleporting to', position.x, position.y, position.z)
          teleportPlayer(entity, position, new Quaternion())
        }
      }
    ]
  }

  // DEBUG STUFF
  if (isDev) {
    const teleportballkey = 130

    inputs.schema.inputMap.set('h', teleportballkey)
    inputs.schema.inputButtonBehaviors[teleportballkey] = {
      started: [
        {
          behavior: (entity: Entity) => {
            const { gameName, ownedObjects } = getComponent(entity, GamePlayer)
            addStateComponent(entity, State.Waiting)
            const game = getGameFromName(gameName)

            const gameScore = getStorage(entity, { name: 'GameScore' })
            const holeEntity = game.gameObjects['GolfHole'][gameScore.score.goal]
            const ballEntity = ownedObjects['GolfBall']
            const position = new Vector3().copy(getComponent(holeEntity, TransformComponent).position)
            position.y += 0.5
            teleportObject(ballEntity, { position })
          }
        }
      ]
    }
  }
}
