import { Material, Mesh, Quaternion, Vector3 } from 'three'
import { teleportPlayer } from '../../../../avatar/functions/teleportPlayer'
import { LifecycleValue } from '../../../../common/enums/LifecycleValue'
import { isDev } from '../../../../common/functions/isDev'
import { NumericalType } from '../../../../common/types/NumericalTypes'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { InputComponent } from '../../../../input/components/InputComponent'
import { GamepadButtons } from '../../../../input/enums/InputEnums'
import { InputValue } from '../../../../input/interfaces/InputValue'
import { InputAlias } from '../../../../input/types/InputAlias'
import { NetworkObjectComponent } from '../../../../networking/components/NetworkObjectComponent'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { TransformComponent } from '../../../../transform/components/TransformComponent'
import { GamePlayer } from '../../../components/GamePlayer'
import { getGameFromName } from '../../../functions/functions'
import { addStateComponent, removeStateComponent } from '../../../functions/functionsState'
import { getStorage } from '../../../functions/functionsStorage'
import { State } from '../../../types/GameComponents'
import { teleportObject } from './teleportObject'
import { GolfClubComponent } from '../components/GolfClubComponent'
import { hideClub } from '../prefab/GolfClubPrefab'
import { isClient } from '../../../../common/functions/isClient'
import { GolfState } from '../GolfGameComponents'
import { VelocityComponent } from '../../../../physics/components/VelocityComponent'

// we need to figure out a better way than polluting an 8 bit namespace :/

export enum GolfInput {
  TELEPORT = 120,
  TOGGLECLUB = 121
}

export const setupPlayerInput = (entityPlayer: Entity) => {
  const inputs = getComponent(entityPlayer, InputComponent)

  // override the default mapping and behavior of input schema and interact
  inputs.schema.inputMap.set('k', GolfInput.TELEPORT)
  inputs.schema.inputMap.set(GamepadButtons.A, GolfInput.TELEPORT)

  inputs.schema.behaviorMap.set(
    GolfInput.TELEPORT,
    (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number) => {
      if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
      const { ownedObjects } = getComponent(entity, GamePlayer)
      const ballEntity = ownedObjects['GolfBall']
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
      if (hasComponent(entity, State.YourTurn)) return

      const { ownedObjects } = getComponent(entity, GamePlayer)
      const clubEntity = ownedObjects['GolfClub']
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
        const { gameName, ownedObjects } = getComponent(entity, GamePlayer)
        addStateComponent(entity, State.Waiting)
        const game = getGameFromName(gameName)

        const gameScore = getStorage(entity, { name: 'GameScore' })
        const holeEntity = game.gameObjects['GolfHole'][gameScore.score.goal]
        const ballEntity = ownedObjects['GolfBall']
        removeStateComponent(ballEntity, State.Active)
        addStateComponent(ballEntity, State.Inactive)
        removeStateComponent(ballEntity, GolfState.BallStopped)
        removeStateComponent(ballEntity, GolfState.AlmostStopped)
        addStateComponent(ballEntity, GolfState.BallMoving)
        addStateComponent(entity, GolfState.AlreadyHit)
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
        const { ownedObjects } = getComponent(entity, GamePlayer)
        const ballEntity = ownedObjects['GolfBall']
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
