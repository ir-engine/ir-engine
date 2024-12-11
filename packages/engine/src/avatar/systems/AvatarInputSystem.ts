/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Quaternion, Vector3 } from 'three'

import {
  ComponentType,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { getState } from '@ir-engine/hyperflux'
import { Vector3_Up, Vector3_Zero } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { StandardGamepadButton } from '@ir-engine/spatial/src/input/state/ButtonState'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { ClientInputSystem } from '@ir-engine/spatial/src/input/systems/ClientInputSystem'
import { RaycastArgs } from '@ir-engine/spatial/src/physics/classes/Physics'
import { RigidBodyFixedTagComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@ir-engine/spatial/src/physics/functions/getInteractionGroups'
import { SceneQueryType } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { AvatarControllerComponent } from '.././components/AvatarControllerComponent'
import { AvatarTeleportComponent } from '.././components/AvatarTeleportComponent'
import { autopilotSetPosition } from '.././functions/autopilotFunctions'
import { translateAndRotateAvatar } from '.././functions/moveAvatar'
import { AvatarAxesControlScheme, AvatarInputSettingsState } from '.././state/AvatarInputSettingsState'
import { AvatarComponent } from '../components/AvatarComponent'
import { applyInputSourcePoseToIKTargets } from '../functions/applyInputSourcePoseToIKTargets'
import { setIkFootTarget } from '../functions/avatarFootHeuristics'

import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { FollowCameraMode } from '@ir-engine/spatial/src/camera/types/FollowCameraMode'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { getThumbstickOrThumbpadAxes } from '@ir-engine/spatial/src/input/functions/getThumbstickOrThumbpadAxes'

const _quat = new Quaternion()

export const InputSourceAxesDidReset = new WeakMap<XRInputSource, boolean>()

export const AvatarAxesControlSchemeBehavior = {
  [AvatarAxesControlScheme.Move]: (
    inputSource: XRInputSource,
    controller: ComponentType<typeof AvatarControllerComponent>,
    handdedness: XRHandedness
  ) => {
    const [x, z] = getThumbstickOrThumbpadAxes(inputSource, handdedness)
    controller.gamepadLocalInput.x += x
    controller.gamepadLocalInput.z += z
  },

  [AvatarAxesControlScheme.Teleport]: (
    inputSource: XRInputSource,
    controller: ComponentType<typeof AvatarControllerComponent>,
    handdedness: XRHandedness
  ) => {
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    const [x, z] = getThumbstickOrThumbpadAxes(inputSource, handdedness)

    if (x === 0 && z === 0) {
      InputSourceAxesDidReset.set(inputSource, true)
      if (inputSource.handedness === getOptionalComponent(selfAvatarEntity, AvatarTeleportComponent)?.side)
        removeComponent(selfAvatarEntity, AvatarTeleportComponent)
    }

    if (!InputSourceAxesDidReset.get(inputSource)) return

    const canTeleport = z < -0.75
    const canRotate = Math.abs(x) > 0.1 && Math.abs(z) < 0.1

    if (canRotate) {
      const angle = (Math.PI / 6) * (x > 0 ? -1 : 1) // 30 degrees
      translateAndRotateAvatar(selfAvatarEntity, Vector3_Zero, _quat.setFromAxisAngle(Vector3_Up, angle))
      InputSourceAxesDidReset.set(inputSource, false)
    } else if (canTeleport) {
      setComponent(selfAvatarEntity, AvatarTeleportComponent, { side: inputSource.handedness })
      InputSourceAxesDidReset.set(inputSource, false)
    }
  }
}
const interactionGroups = getInteractionGroups(CollisionGroups.Default, CollisionGroups.Avatars)

const raycastComponentData = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 100,
  groups: interactionGroups
} as RaycastArgs

const onShiftLeft = () => {
  const entity = AvatarComponent.getSelfAvatarEntity()
  if (!entity) return
  const controller = getMutableComponent(entity, AvatarControllerComponent)
  controller.isWalking.set(!controller.isWalking.value)
}

// const isAvatarClicked = () => {
//   const pointerState = getState(InputState).pointerState
//   const hits = Physics.castRayFromCamera(
//     getComponent(Engine.instance.cameraEntity, CameraComponent),
//     pointerState.position,
//     getState(PhysicsState).physicsWorld,
//     raycastComponentData
//   )
//   if (hits.length) {
//     const hit = hits[0]
//     const hitEntity = (hit.body?.userData as any)?.entity as Entity
//     const avatarEntity = AvatarComponent.getSelfAvatarEntity()
//     if (typeof hitEntity !== 'undefined' && hitEntity == avatarEntity) {
//       return true
//     }
//   }
//   return false
// }

let clickCount = 0
const clickTimeout = 0.6
let douubleClickTimer = 0
const secondClickTimeout = 0.2
let secondClickTimer = 0

// TODO: this should be done using the input system components,
// which already performs raycasts and has the necessary data
const getAvatarDoubleClick = (buttons): boolean => {
  // const followComponent = getOptionalComponent(Engine.instance.cameraEntity, FollowCameraComponent)
  // if (followComponent && followComponent.zoomLevel < 1) return false

  // if (buttons.PrimaryClick?.up) {
  // if (!isAvatarClicked()) {
  //   clickCount = 0
  //   secondClickTimer = 0
  //   douubleClickTimer = 0
  //   return false
  // }
  // clickCount += 1
  // }
  // if (clickCount < 1) return false
  // if (clickCount > 1) {
  //   secondClickTimer += getState(ECSState).deltaSeconds
  //   if (secondClickTimer <= secondClickTimeout) return true
  //   secondClickTimer = 0
  //   clickCount = 0
  //   return false
  // }
  // douubleClickTimer += getState(ECSState).deltaSeconds
  // if (douubleClickTimer <= clickTimeout) return false
  // douubleClickTimer = 0
  // clickCount = 0
  return false
}

const walkableQuery = defineQuery([RigidBodyFixedTagComponent, InputComponent])

let mouseMovedDuringPrimaryClick = false

const execute = () => {
  if (!Engine.instance.userID) return

  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  if (!selfAvatarEntity) return

  applyInputSourcePoseToIKTargets(Engine.instance.userID)

  const { deltaSeconds } = getState(ECSState)
  setIkFootTarget(Engine.instance.userID, deltaSeconds)

  const inputState = getState(InputState)
  const avatarInputSettings = getState(AvatarInputSettingsState)

  const controller = getComponent(selfAvatarEntity, AvatarControllerComponent)

  const xrState = getState(XRState)
  const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar
  const isMovementControlsEnabled = XRState.isMovementControlsEnabled

  if (!isMovementControlsEnabled) return

  if (!isCameraAttachedToAvatar && !getState(XRState).session) {
    const firstWalkableEntityWithInput = walkableQuery().find(
      (entity) => getComponent(entity, InputComponent)?.inputSources.length
    )

    if (firstWalkableEntityWithInput) {
      const inputComponent = getComponent(firstWalkableEntityWithInput, InputComponent)
      const inputSourceEntity = inputComponent?.inputSources[0]

      if (inputSourceEntity && hasComponent(inputSourceEntity, InputPointerComponent)) {
        const pointerComponent = getComponent(inputSourceEntity, InputPointerComponent)
        const inputSourceComponent = getComponent(inputSourceEntity, InputSourceComponent)

        if (inputSourceComponent?.buttons.PrimaryClick?.touched) {
          const mouseMoved = pointerComponent.movement.lengthSq() > 0
          if (mouseMoved) mouseMovedDuringPrimaryClick = true

          if (inputSourceComponent.buttons.PrimaryClick.up) {
            if (!mouseMovedDuringPrimaryClick) {
              autopilotSetPosition(selfAvatarEntity)
            } else mouseMovedDuringPrimaryClick = false
          }
        }
      }
    }
  }

  controller.gamepadLocalInput.set(0, 0, 0)

  const viewerEntity = Engine.instance.viewerEntity

  const inputPointerEntity = InputPointerComponent.getPointersForCamera(viewerEntity)[0]

  if (!isMobile && !inputPointerEntity && !xrState.session) return

  const buttons = InputComponent.getMergedButtons(viewerEntity)

  if (buttons.ShiftLeft?.down) onShiftLeft()

  const gamepadJump = buttons[StandardGamepadButton.StandardGamepadButtonA]?.down

  //** touch input (only for avatar jump)*/
  const doubleClicked = isCameraAttachedToAvatar ? false : getAvatarDoubleClick(buttons)
  /** keyboard input */
  const keyDeltaX =
    (buttons.KeyA?.pressed ? -1 : 0) +
    (buttons.KeyD?.pressed ? 1 : 0) +
    (buttons.ArrowLeft?.pressed ? -1 : 0) +
    (buttons.ArrowRight?.pressed ? 1 : 0) +
    (buttons[StandardGamepadButton.StandardGamepadDPadLeft]?.pressed ? -1 : 0) +
    (buttons[StandardGamepadButton.StandardGamepadDPadRight]?.pressed ? 1 : 0)
  const keyDeltaZ =
    (buttons.KeyW?.pressed ? -1 : 0) +
    (buttons.KeyS?.pressed ? 1 : 0) +
    (buttons.ArrowUp?.pressed ? -1 : 0) +
    (buttons.ArrowDown?.pressed ? 1 : 0) +
    (buttons[StandardGamepadButton.StandardGamepadDPadUp]?.pressed ? -1 : 0) +
    (buttons[StandardGamepadButton.StandardGamepadDPadDown]?.pressed ? -1 : 0)

  if (keyDeltaZ === 1) {
    // todo: auto-adjust target distance in follow camera system based on target velocity
    const follow = getOptionalComponent(controller.cameraEntity, FollowCameraComponent)
    if (follow?.mode === FollowCameraMode.ThirdPerson || follow?.mode === FollowCameraMode.ShoulderCam)
      follow.targetDistance = Math.max(follow.targetDistance, follow.effectiveMaxDistance * 0.5)
  }

  controller.gamepadLocalInput.set(keyDeltaX, 0, keyDeltaZ).normalize()

  controller.gamepadJumpActive = !!buttons.Space?.pressed || gamepadJump || doubleClicked

  // TODO: refactor AvatarControlSchemes to allow multiple input sources to be passed
  for (const eid of InputSourceComponent.nonCapturedInputSources()) {
    if (hasComponent(eid, InputPointerComponent)) continue
    const inputSource = getComponent(eid, InputSourceComponent)
    const controlScheme =
      !isCameraAttachedToAvatar || inputSource.source.handedness === 'none'
        ? AvatarAxesControlScheme.Move
        : inputSource.source.handedness === inputState.preferredHand
        ? avatarInputSettings.rightAxesControlScheme
        : avatarInputSettings.leftAxesControlScheme
    AvatarAxesControlSchemeBehavior[controlScheme](
      inputSource.source,
      controller,
      inputState.preferredHand === 'left' ? 'right' : 'left'
    )
  }
}

export const AvatarInputSystem = defineSystem({
  uuid: 'ee.engine.AvatarInputSystem',
  insert: { after: ClientInputSystem },
  execute
})
