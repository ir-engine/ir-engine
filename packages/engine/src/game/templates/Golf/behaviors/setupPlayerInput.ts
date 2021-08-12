import { Quaternion, Vector3 } from 'three'
import { teleportPlayer } from '../../../../avatar/functions/teleportPlayer'
import { LifecycleValue } from '../../../../common/enums/LifecycleValue'
import { isDev } from '../../../../common/functions/isDev'
import { NumericalType } from '../../../../common/types/NumericalTypes'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { InputComponent } from '../../../../input/components/InputComponent'
import { GamepadButtons } from '../../../../input/enums/InputEnums'
import { InputValue } from '../../../../input/interfaces/InputValue'
import { InputAlias } from '../../../../input/types/InputAlias'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { teleportObject } from './teleportObject'
import { GolfClubComponent } from '../components/GolfClubComponent'
import { hideClub } from '../prefab/GolfClubPrefab'
import { isClient } from '../../../../common/functions/isClient'
import { VelocityComponent } from '../../../../physics/components/VelocityComponent'
import { GolfObjectEntities, GolfState } from '../GolfSystem'

// we need to figure out a better way than polluting an 8 bit namespace :/

export enum GolfInput {
  TELEPORT = 120,
  TOGGLECLUB = 121
}

export const setupPlayerInput = (entityPlayer: Entity, playerNumber: number) => {
  const inputs = getComponent(entityPlayer, InputComponent)

  if (!inputs) return

  // override the default mapping and behavior of input schema and interact
  inputs.schema.inputMap.set('k', GolfInput.TELEPORT)
  inputs.schema.inputMap.set(GamepadButtons.A, GolfInput.TELEPORT)

  inputs.schema.behaviorMap.set(
    GolfInput.TELEPORT,
    (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number) => {
      if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
      const ballEntity = GolfObjectEntities.get(`GolfBall-${playerNumber}`)
      if (!ballEntity) return
      const ballTransform = getComponent(ballEntity, TransformComponent)
      const position = ballTransform.position
      console.log('teleporting to', position.x, position.y, position.z)
      teleportPlayer(entity, position, new Quaternion())
    }
  )

  inputs.schema.inputMap.set('y', GolfInput.TOGGLECLUB)
  inputs.schema.inputMap.set(GamepadButtons.Y, GolfInput.TOGGLECLUB)

  inputs.schema.behaviorMap.set(
    GolfInput.TOGGLECLUB,
    (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number) => {
      if (inputValue.lifecycleState !== LifecycleValue.STARTED) return

      // TODO: check for if it's your turn or not
      // if (hasComponent(entity, State.YourTurn)) return

      const clubEntity = GolfObjectEntities.get(`GolfClub-${playerNumber}`)
      const golfClubComponent = getComponent(clubEntity, GolfClubComponent)
      golfClubComponent.hidden = !golfClubComponent.hidden

      if (isClient) {
        hideClub(clubEntity, golfClubComponent.hidden, false)
      }
    }
  )

  // DEBUG STUFF
  if (isDev) {
    const teleportballkey = 130
    const teleportballOut = 140

    inputs.schema.inputMap.set('h', teleportballkey)
    inputs.schema.behaviorMap.set(
      teleportballkey,
      (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number) => {
        if (inputValue.lifecycleState !== LifecycleValue.STARTED) return

        const currentHole = GolfState.currentHole
        const holeEntity = GolfObjectEntities.get(`GolfHole-${currentHole}`)
        const ballEntity = GolfObjectEntities.get(`GolfBall-${playerNumber}`)
        const position = new Vector3().copy(getComponent(holeEntity, TransformComponent).position)
        position.y += 0.5
        teleportObject(ballEntity, position)
      }
    )

    inputs.schema.inputMap.set('b', teleportballOut)
    inputs.schema.behaviorMap.set(
      teleportballOut,
      (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number) => {
        if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
        // const { ownedObjects } = getComponent(entity, GamePlayer)
        const ballEntity = GolfObjectEntities.get(`GolfBall-${playerNumber}`)
        const collider = getComponent(ballEntity, ColliderComponent)
        const velocity = getComponent(ballEntity, VelocityComponent)
        velocity.velocity.set(0, 0, 0)
        collider.body.updateTransform({
          translation: {
            x: 2,
            y: 1,
            z: -4
          },
          rotation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1
          },
          linearVelocity: {
            x: 0,
            y: 0,
            z: 0
          }
        })
        collider.body.setLinearVelocity(new Vector3(), true)
        collider.body.setAngularVelocity(new Vector3(), true)
      }
    )
  }
}
