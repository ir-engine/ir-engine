import { Euler, MathUtils, Quaternion, Vector3 } from 'three'
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
import { getGolfPlayerNumber } from '../functions/golfFunctions'
import { swingClub } from '../functions/golfBotHookFunctions'
import { initializeBot, rotatePlayer } from '../../../../bot/functions/botHookFunctions'
import { overrideXR, simulateXR, startXR, updateHead, xrSupported } from '../../../../bot/functions/xrBotHookFunctions'
import { Engine } from '../../../../ecs/classes/Engine'
import { loadScript } from '../../../../common/functions/loadScripts'
import { eulerToQuaternion } from '../../../../common/functions/MathRandomFunctions'
import { AvatarComponent } from '../../../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../../../avatar/components/AvatarControllerComponent'
import { angle } from '@turf/turf'
import { rotateViewVectorXZ } from '../../../../camera/systems/CameraSystem'

// we need to figure out a better way than polluting an 8 bit namespace :/

export enum GolfInput {
  TELEPORT = 120,
  TOGGLECLUB = 121
}

const rotate90onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)

export const setupPlayerInput = (entityPlayer: Entity) => {
  const inputs = getComponent(entityPlayer, InputComponent)

  // override the default mapping and behavior of input schema and interact
  inputs.schema.inputMap.set('k', GolfInput.TELEPORT)
  inputs.schema.inputMap.set(GamepadButtons.A, GolfInput.TELEPORT)

  inputs.schema.behaviorMap.set(
    GolfInput.TELEPORT,
    (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number) => {
      if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
      const playerNumber = getGolfPlayerNumber(entity)
      const ballEntity = GolfObjectEntities.get(`GolfBall-${playerNumber}`)
      if (!ballEntity) return
      const ballTransform = getComponent(ballEntity, TransformComponent)
      const position = ballTransform.position
      console.log('teleporting to', position.x, position.y, position.z)

      const holeEntity = GolfObjectEntities.get(`GolfHole-${GolfState.currentHole.value}`)
      const holeTransform = getComponent(holeEntity, TransformComponent)

      // face character towards hole
      const angle =
        new Vector3()
          .copy(holeTransform.position)
          .setY(0)
          .normalize()
          .angleTo(new Vector3().copy(ballTransform.position).setY(0).normalize()) +
        Math.PI / 2
      const controller = getComponent(entity, AvatarControllerComponent)
      const actor = getComponent(entity, AvatarComponent)

      const pos = new Vector3(position.x, position.y, position.z)
      pos.y += actor.avatarHalfHeight
      controller.controller.updateTransform({
        translation: pos
      })
      rotateViewVectorXZ(actor.viewVector, angle)

      const transform = getComponent(entity, TransformComponent)
      const quat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle)
      transform.rotation.copy(quat)

      controller.controller.velocity.setScalar(0)
    }
  )

  inputs.schema.inputMap.set('y', GolfInput.TOGGLECLUB)
  inputs.schema.inputMap.set(GamepadButtons.Y, GolfInput.TOGGLECLUB)

  inputs.schema.behaviorMap.set(
    GolfInput.TOGGLECLUB,
    (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number) => {
      if (inputValue.lifecycleState !== LifecycleValue.STARTED) return

      const playerNumber = getGolfPlayerNumber(entity)
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

    inputs.schema.inputMap.set('h', teleportballkey)
    inputs.schema.behaviorMap.set(
      teleportballkey,
      (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number) => {
        if (inputValue.lifecycleState !== LifecycleValue.STARTED) return

        const playerNumber = getGolfPlayerNumber(entity)
        const currentHole = GolfState.currentHole.value
        const holeEntity = GolfObjectEntities.get(`GolfHole-${currentHole}`)
        const ballEntity = GolfObjectEntities.get(`GolfBall-${playerNumber}`)
        const position = new Vector3().copy(getComponent(holeEntity, TransformComponent).position)
        position.y += 0.5
        teleportObject(ballEntity, position)
      }
    )

    const teleportballOut = 140
    inputs.schema.inputMap.set('b', teleportballOut)
    inputs.schema.behaviorMap.set(
      teleportballOut,
      (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number) => {
        if (inputValue.lifecycleState !== LifecycleValue.STARTED) return

        const playerNumber = getGolfPlayerNumber(entity)
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
    if (isClient) {
      let xrSetup = false
      const setupBotKey = 141
      inputs.schema.inputMap.set(';', setupBotKey)
      inputs.schema.behaviorMap.set(setupBotKey, () => {
        if (xrSetup) return
        xrSetup = true
        simulateXR()
      })
    }

    const swingClubKey = 142
    inputs.schema.inputMap.set('l', swingClubKey)
    inputs.schema.behaviorMap.set(
      swingClubKey,
      (entity: Entity, inputKey: InputAlias, inputValue: InputValue<NumericalType>, delta: number) => {
        if (inputValue.lifecycleState !== LifecycleValue.STARTED) return
        updateHead({
          position: [0, 2, 1],
          rotation: eulerToQuaternion(-1.25, 0, 0).toArray()
        })
        // rotatePlayer()
        swingClub()
      }
    )
  }
}
