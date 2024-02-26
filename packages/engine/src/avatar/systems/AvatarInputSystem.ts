/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Quaternion, Vector3 } from 'three'

import { isDev } from '@etherealengine/common/src/config'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import {
  ComponentType,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { V_000, V_010 } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@etherealengine/spatial/src/input/components/InputPointerComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { StandardGamepadButton } from '@etherealengine/spatial/src/input/state/ButtonState'
import { InputState } from '@etherealengine/spatial/src/input/state/InputState'
import { ClientInputSystem } from '@etherealengine/spatial/src/input/systems/ClientInputSystem'
import { RaycastArgs } from '@etherealengine/spatial/src/physics/classes/Physics'
import { RigidBodyFixedTagComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@etherealengine/spatial/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@etherealengine/spatial/src/physics/functions/getInteractionGroups'
import { SceneQueryType } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { XRControlsState, XRState } from '@etherealengine/spatial/src/xr/XRState'
import { AvatarControllerComponent } from '.././components/AvatarControllerComponent'
import { AvatarTeleportComponent } from '.././components/AvatarTeleportComponent'
import { autopilotSetPosition } from '.././functions/autopilotFunctions'
import { translateAndRotateAvatar } from '.././functions/moveAvatar'
import { AvatarAxesControlScheme, AvatarInputSettingsState } from '.././state/AvatarInputSettingsState'
import { applyInputSourcePoseToIKTargets } from '../functions/applyInputSourcePoseToIKTargets'
import { setIkFootTarget } from '../functions/avatarFootHeuristics'

const _quat = new Quaternion()

/**
 * On 'xr-standard' mapping, get thumbstick input [2,3], fallback to thumbpad input [0,1]
 * On 'standard' mapping, get thumbstick input [0,1]
 */
export function getThumbstickOrThumbpadAxes(inputSource: XRInputSource, thumstick: XRHandedness, deadZone = 0.05) {
  const gamepad = inputSource.gamepad
  const axes = gamepad!.axes
  const axesIndex = inputSource.gamepad?.mapping === 'xr-standard' || thumstick === 'right' ? 2 : 0
  const xAxis = Math.abs(axes[axesIndex]) > deadZone ? axes[axesIndex] : 0
  const zAxis = Math.abs(axes[axesIndex + 1]) > deadZone ? axes[axesIndex + 1] : 0
  return [xAxis, zAxis] as [number, number]
}

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
    const localClientEntity = Engine.instance.localClientEntity
    const [x, z] = getThumbstickOrThumbpadAxes(inputSource, handdedness)

    if (x === 0 && z === 0) {
      InputSourceAxesDidReset.set(inputSource, true)
      if (inputSource.handedness === getOptionalComponent(localClientEntity, AvatarTeleportComponent)?.side)
        removeComponent(localClientEntity, AvatarTeleportComponent)
    }

    if (!InputSourceAxesDidReset.get(inputSource)) return

    const canTeleport = z < -0.75
    const canRotate = Math.abs(x) > 0.1 && Math.abs(z) < 0.1

    if (canRotate) {
      const angle = (Math.PI / 6) * (x > 0 ? -1 : 1) // 30 degrees
      translateAndRotateAvatar(localClientEntity, V_000, _quat.setFromAxisAngle(V_010, angle))
      InputSourceAxesDidReset.set(inputSource, false)
    } else if (canTeleport) {
      setComponent(localClientEntity, AvatarTeleportComponent, { side: inputSource.handedness })
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
  const controller = getMutableComponent(Engine.instance.localClientEntity, AvatarControllerComponent)
  controller.isWalking.set(!controller.isWalking.value)
}

const onKeyP = () => {
  getMutableState(RendererState).physicsDebug.set(!getMutableState(RendererState).physicsDebug.value)
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
//     if (typeof hitEntity !== 'undefined' && hitEntity == Engine.instance.localClientEntity) {
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

const inputSourceQuery = defineQuery([InputSourceComponent])

const walkableQuery = defineQuery([RigidBodyFixedTagComponent, InputComponent])

let mouseMovedDuringPrimaryClick = false

const execute = () => {
  const { localClientEntity } = Engine.instance
  if (!localClientEntity) return

  applyInputSourcePoseToIKTargets(localClientEntity)

  const { deltaSeconds } = getState(ECSState)
  setIkFootTarget(localClientEntity, deltaSeconds)

  const inputState = getState(InputState)
  const avatarInputSettings = getState(AvatarInputSettingsState)

  const controller = getComponent(localClientEntity, AvatarControllerComponent)
  const nonCapturedInputSourceEntities = InputSourceComponent.nonCapturedInputSourceQuery()

  const { isCameraAttachedToAvatar, isMovementControlsEnabled } = getState(XRControlsState)

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
              autopilotSetPosition(Engine.instance.localClientEntity)
            } else mouseMovedDuringPrimaryClick = false
          }
        }
      }
    }
  }

  let inputEntities: Entity[] = nonCapturedInputSourceEntities
  if (inputEntities.length === 0) {
    inputEntities = inputSourceQuery().filter((entity) => {
      const inputSource = getComponent(entity, InputSourceComponent)
      if (controller.cameraEntity === inputSource.assignedButtonEntity) return true
    })
  }

  const buttons = InputSourceComponent.getMergedButtons(inputEntities)

  if (buttons.ShiftLeft?.down) onShiftLeft()

  const gamepadJump = buttons[StandardGamepadButton.ButtonA]?.down

  if (isDev) {
    if (buttons.KeyP?.down) onKeyP()
  }

  if (!isMovementControlsEnabled) return

  //** touch input (only for avatar jump)*/
  const doubleClicked = isCameraAttachedToAvatar ? false : getAvatarDoubleClick(buttons)
  /** keyboard input */
  const keyDeltaX =
    (buttons.KeyA?.pressed ? -1 : 0) +
    (buttons.KeyD?.pressed ? 1 : 0) +
    (buttons[StandardGamepadButton.DPadLeft]?.pressed ? -1 : 0) +
    (buttons[StandardGamepadButton.DPadRight]?.pressed ? 1 : 0)
  const keyDeltaZ =
    (buttons.KeyW?.pressed ? -1 : 0) +
    (buttons.KeyS?.pressed ? 1 : 0) +
    (buttons.ArrowUp?.pressed ? -1 : 0) +
    (buttons.ArrowDown?.pressed ? 1 : 0) +
    (buttons[StandardGamepadButton.DPadUp]?.pressed ? -1 : 0) +
    (buttons[StandardGamepadButton.DPadDown]?.pressed ? -1 : 0)

  controller.gamepadLocalInput.set(keyDeltaX, 0, keyDeltaZ).normalize()

  controller.gamepadJumpActive = !!buttons.Space?.pressed || gamepadJump || doubleClicked

  // TODO: refactor AvatarControlSchemes to allow multiple input sources to be passed
  for (const eid of inputEntities) {
    const inputSource = getComponent(eid, InputSourceComponent)
    const controlScheme =
      inputSource.source.handedness === 'none' || !isCameraAttachedToAvatar
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
