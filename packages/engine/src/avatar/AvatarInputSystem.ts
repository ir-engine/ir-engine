import { CharacterCollision } from '@dimforge/rapier3d-compat'
import { Quaternion, Vector3 } from 'three'

import { isDev } from '@xrengine/common/src/config'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { ObjectDirection } from '../common/constants/Axis3D'
import { V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { EngineActions } from '../ecs/classes/EngineState'
import { World } from '../ecs/classes/World'
import { getComponent, hasComponent, removeComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { InteractState } from '../interaction/systems/InteractiveSystem'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { Physics } from '../physics/classes/Physics'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../physics/functions/getInteractionGroups'
import { boxDynamicConfig } from '../physics/functions/physicsObjectDebugFunctions'
import { SceneQueryType } from '../physics/types/PhysicsTypes'
import { accessEngineRendererState, EngineRendererAction } from '../renderer/EngineRendererState'
import { LocalTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { getControlMode, XRState } from '../xr/XRState'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { AvatarTeleportComponent } from './components/AvatarTeleportComponent'
import {
  avatarApplyRotation,
  calculateAvatarDisplacementFromGamepad,
  rotateAvatar,
  updateAvatarControllerOnGround
} from './functions/moveAvatar'
import { AvatarInputSettingsState } from './state/AvatarInputSettingsState'

export default async function AvatarInputSystem(world: World) {
  const interactState = getState(InteractState)
  const avatarInputSettingsState = getState(AvatarInputSettingsState)
  const xrState = getState(XRState)

  const onShiftLeft = () => {
    if (world.localClientEntity) {
      const controller = getComponent(world.localClientEntity, AvatarControllerComponent)
      controller.isWalking = !controller.isWalking
    }
  }

  const onKeyE = () => {
    dispatchAction(
      EngineActions.interactedWithObject({
        targetEntity: interactState.available[0].value,
        handedness: 'none'
      })
    )
  }

  const onLeftTrigger = () => {
    if (world.localClientEntity) {
      dispatchAction(
        EngineActions.interactedWithObject({
          targetEntity: interactState.available[0].value,
          handedness: 'left'
        })
      )
    }
  }

  const onRightTrigger = () => {
    if (world.localClientEntity) {
      dispatchAction(
        EngineActions.interactedWithObject({
          targetEntity: interactState.available[0].value,
          handedness: 'right'
        })
      )
    }
  }

  const onKeyO = () => {
    if (world.localClientEntity) {
      dispatchAction(
        WorldNetworkAction.spawnDebugPhysicsObject({
          config: boxDynamicConfig
        })
      )
    }
  }

  const onKeyP = () => {
    if (world.localClientEntity) {
      dispatchAction(
        EngineRendererAction.setDebug({
          debugEnable: !accessEngineRendererState().debugEnable.value
        })
      )
    }
  }

  const cameraDirection = new Vector3()
  const forwardOrientation = new Quaternion()
  const gamepadMovementDisplacement = new Vector3()
  const desiredAvatarTranslation = new Vector3()

  const avatarGroundRaycast = {
    type: SceneQueryType.Closest,
    origin: new Vector3(),
    direction: ObjectDirection.Down,
    maxDistance: 0.5,
    groups: getInteractionGroups(CollisionGroups.Avatars, CollisionGroups.Ground)
  }

  const cameraDifference = new Vector3()
  const movementDelta = new Vector3()
  const lastMovementDelta = new Vector3()
  let isVRRotatingLeft = false
  let isVRRotatingRight = false
  let lastFixedTick = world.fixedElapsedSeconds

  const execute = () => {
    const { inputSources, localClientEntity, fixedElapsedSeconds, deltaSeconds } = world
    if (!localClientEntity) return

    const fixedDeltaSeconds = fixedElapsedSeconds - lastFixedTick
    lastFixedTick = fixedElapsedSeconds

    const keys = world.buttons

    if (keys.ShiftLeft?.down) onShiftLeft()
    if (keys.KeyE?.down) onKeyE()
    if (keys.LeftTrigger?.down) onLeftTrigger()
    if (keys.RightTrigger?.down) onRightTrigger()

    if (isDev) {
      if (keys.KeyO?.down) onKeyO()
      if (keys.KeyP?.down) onKeyP()
    }

    const cameraAttached = getControlMode() === 'attached'

    /**
     * Move avatar with camera viewer pose when in attached mode
     */
    if (cameraAttached) {
      const rigidBody = getComponent(localClientEntity, RigidBodyComponent)
      const cameraLocalTransform = getComponent(world.cameraEntity, LocalTransformComponent)
      cameraDifference.copy(cameraLocalTransform.position).sub(xrState.previousCameraPosition.value)
      rigidBody.position.add(cameraDifference)
      rigidBody.body.setTranslation(rigidBody.position, true)
    }

    /**
     * Move avatar with controls
     */

    /** keyboard input */
    const keyDeltaX = (keys.KeyA?.pressed ? -1 : 0) + (keys.KeyD?.pressed ? 1 : 0)
    const keyDeltaY = keys.Space?.down ? 1 : 0
    const keyDeltaZ =
      (keys.KeyW?.pressed ? -1 : 0) +
      (keys.KeyS?.pressed ? 1 : 0) +
      (keys.ArrowUp?.pressed ? -1 : 0) +
      (keys.ArrowDown?.pressed ? 1 : 0)

    movementDelta.set(keyDeltaX, 0, keyDeltaZ)

    const teleporting =
      cameraAttached && avatarInputSettingsState.controlScheme.value === 'AvatarMovementScheme_Teleport'
    const preferredHand = avatarInputSettingsState.preferredHand.value

    const computedMovementRounded = new Vector3()

    let teleport = null as null | XRHandedness

    /** override keyboard input with XR axes input */
    for (const inputSource of inputSources) {
      if (inputSource.gamepad?.mapping === 'xr-standard') {
        const axes = inputSource.gamepad!.axes

        let xDelta = 0
        let yDelta = 0
        /** @todo do we want to sum these inputs up? */
        if (axes.length <= 2) {
          xDelta += Math.abs(axes[0]) > 0.05 ? axes[0] : 0
          yDelta += Math.abs(axes[1]) > 0.05 ? axes[1] : 0
        }
        if (axes.length >= 4) {
          xDelta += Math.abs(axes[2]) > 0.05 ? axes[2] : 0
          yDelta += Math.abs(axes[3]) > 0.05 ? axes[3] : 0
        }

        if (teleporting) {
          if (yDelta < -0.75 && !teleport) {
            teleport = inputSource.handedness
          }

          const canRotate = Math.abs(xDelta) > 0.1 && Math.abs(yDelta) < 0.1

          if (canRotate) {
            if (
              (inputSource.handedness === 'left' && !isVRRotatingLeft) ||
              (inputSource.handedness === 'right' && !isVRRotatingRight)
            )
              rotateAvatar(localClientEntity, (Math.PI / 6) * (xDelta > 0 ? -1 : 1)) // 30 degrees
          }
          if (inputSource.handedness === 'left') isVRRotatingLeft = canRotate
          else isVRRotatingRight = canRotate

          movementDelta.x = xDelta
          movementDelta.z = yDelta
        } else {
          /** preferred hand rotates */
          if (preferredHand === inputSource.handedness || inputSource.handedness === 'none') {
            rotateAvatar(localClientEntity, -xDelta * world.deltaSeconds)

            /** mobile/detatched avatar right thumbstick movement */
            if (!cameraAttached) {
              movementDelta.x += xDelta
              movementDelta.z += yDelta
            }
          } else {
            /** if other hand */
            movementDelta.z += yDelta
          }
        }
      }
    }

    if (teleporting) {
      if (teleport) {
        setComponent(localClientEntity, AvatarTeleportComponent, { side: teleport })
      } else {
        removeComponent(localClientEntity, AvatarTeleportComponent)
      }
    } else {
      const controller = getComponent(localClientEntity, AvatarControllerComponent)
      controller.isInAir = !controller.controller.computedGrounded()

      // updateAvatarControllerOnGround(localClientEntity)
      const rigidbody = getComponent(localClientEntity, RigidBodyComponent)
      /** @todo put y in a separate data structure */
      controller.gamepadMovementDirection.copy(movementDelta).normalize()
      /** smooth XZ input */
      const lerpAlpha = 1 - Math.exp(-5 * world.deltaSeconds)
      controller.gamepadMovementSmoothed.lerp(controller.gamepadMovementDirection, lerpAlpha)

      /** Apply vertical input velocity such that it is not normalized against XZ movement */
      const isJumping = !!keys.Space?.down

      /** Apply gamepad rotational input to rigidbody */
      avatarApplyRotation(localClientEntity)

      /** calculate the avatar's displacement via a spring based on it's gamepad movement input  */
      calculateAvatarDisplacementFromGamepad(world, localClientEntity, gamepadMovementDisplacement, isJumping)
      gamepadMovementDisplacement.y = controller.gamepadYVelocity * fixedDeltaSeconds
      console.log(gamepadMovementDisplacement.y)

      desiredAvatarTranslation.copy(gamepadMovementDisplacement)

      /** When in attached camera mode, avatar movement should correspond to physical device movement */
      if (cameraAttached) {
        /**
         * @todo #7328 we need a function to explicitly calculate transforms relative to the
         *   origin entity (or any entity), without making assumptions about hierarchy.
         *
         * ex:   `getTransformRelativeTo(world.cameraEntity, world.originEntity)`
         */
        const cameraTransformRelativeToOrigin = getComponent(world.cameraEntity, LocalTransformComponent)
        cameraDifference.copy(cameraTransformRelativeToOrigin.position).sub(xrState.previousCameraPosition.value)
        desiredAvatarTranslation.add(cameraDifference)
      }

      // put desired avatar translation on controller
      // apply gravity in fixed pipeline

      /** Use a kinematic character controller to calculate computed movement */
      /**
       * @todo rapier has a bug with computing movement resulting in the character falling through the world.
       * To get around this, translate downwards and undo this translation if the character is not grounded.
       */
      desiredAvatarTranslation.y -= 0.01
      controller.controller.computeColliderMovement(controller.bodyCollider, desiredAvatarTranslation)
      const computedMovement = computedMovementRounded.copy(controller.controller.computedMovement() as any)

      computedMovement.y = controller.isInAir ? controller.gamepadYVelocity * world.deltaSeconds : 0

      const transform = getComponent(localClientEntity, TransformComponent)
      transform.position.add(computedMovement as Vector3)
      rigidbody.position.copy(transform.position)
    }

    lastMovementDelta.copy(movementDelta)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
