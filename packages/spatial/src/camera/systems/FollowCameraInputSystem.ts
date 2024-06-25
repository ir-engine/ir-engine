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

import { Vector2 } from 'three'

import { Entity } from '@etherealengine/ecs'
import { getComponent, getMutableComponent, getOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { getState } from '@etherealengine/hyperflux'
import { CameraSettings } from '@etherealengine/spatial/src/camera/CameraState'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@etherealengine/spatial/src/camera/components/TargetCameraRotationComponent'
import { setTargetCameraRotation } from '@etherealengine/spatial/src/camera/functions/CameraFunctions'
import { FollowCameraMode } from '@etherealengine/spatial/src/camera/types/FollowCameraMode'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { InputPointerComponent } from '@etherealengine/spatial/src/input/components/InputPointerComponent'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { getThumbstickOrThumbpadAxes } from '@etherealengine/spatial/src/input/functions/getThumbstickOrThumbpadAxes'
import { MouseScroll } from '@etherealengine/spatial/src/input/state/ButtonState'
import { InputState } from '@etherealengine/spatial/src/input/state/InputState'
import { XRState } from '@etherealengine/spatial/src/xr/XRState'
import { clamp } from 'lodash'

// const throttleHandleCameraZoom = throttle(handleFollowCameraZoom, 30, { leading: true, trailing: false })

const pointerPositionDelta = new Vector2()
const pointerQuery = defineQuery([InputPointerComponent])
const epsilon = 0.001

const followCameraModeCycle = [
  FollowCameraMode.FirstPerson,
  FollowCameraMode.ShoulderCam,
  FollowCameraMode.ThirdPerson,
  FollowCameraMode.TopDown
] as FollowCameraMode[]

const onFollowCameraModeCycle = (cameraEntity: Entity) => {
  const follow = getMutableComponent(cameraEntity, FollowCameraComponent)
  const mode = follow.mode.value
  const currentModeIdx = followCameraModeCycle.includes(mode) ? followCameraModeCycle.indexOf(mode) : 0
  const nextModeIdx = (currentModeIdx + 1) % followCameraModeCycle.length
  const nextMode = followCameraModeCycle[nextModeIdx]
  follow.mode.set(nextMode)
}

const onFollowCameraFirstPerson = (cameraEntity: Entity) => {
  const followComponent = getMutableComponent(cameraEntity, FollowCameraComponent)
  followComponent.mode.set(FollowCameraMode.FirstPerson)
}

const onFollowCameraShoulderCam = (cameraEntity: Entity) => {
  const follow = getMutableComponent(cameraEntity, FollowCameraComponent)
  follow.mode.set(FollowCameraMode.ShoulderCam)
  follow.shoulderSide.set((v) => !v)
}

/**
 * Change camera distance.
 * @param cameraEntity Entity holding camera and input component.
 */
export const onFollowCameraZoom = (cameraEntity: Entity, scrollDelta: number): void => {
  if (scrollDelta === 0) return

  const follow = getComponent(cameraEntity, FollowCameraComponent)
  const followState = getMutableComponent(cameraEntity, FollowCameraComponent)

  // Move out of first person mode
  if (follow.targetDistance <= epsilon && scrollDelta > 0) {
    follow.targetDistance = follow.minDistance
    return
  }

  const nextTargetDistance = clamp(follow.targetDistance + scrollDelta, epsilon, follow.maxDistance)

  // Move to first person mode
  if (follow.allowedModes.includes(FollowCameraMode.FirstPerson) && nextTargetDistance < follow.minDistance) {
    follow.targetDistance = epsilon
    setTargetCameraRotation(cameraEntity, 0, follow.theta)
    followState.mode.set(FollowCameraMode.FirstPerson)
    return
  }

  // Rotate camera to the top but let the player rotate if he/she desires
  if (Math.abs(follow.maxDistance - nextTargetDistance) <= 1.0 && scrollDelta > 0 && follow) {
    setTargetCameraRotation(cameraEntity, 85, follow.theta)
  }

  // Rotate from top
  if (Math.abs(follow.maxDistance - follow.targetDistance) <= 1.0 && scrollDelta < 0 && follow.phi >= 80) {
    setTargetCameraRotation(cameraEntity, 45, follow.theta)
  }

  if (Math.abs(follow.targetDistance - nextTargetDistance) > epsilon) {
    follow.targetDistance = nextTargetDistance
  }
}

const execute = () => {
  if (getState(XRState).xrFrame) return

  const deltaSeconds = getState(ECSState).deltaSeconds
  const cameraSettings = getState(CameraSettings)

  for (const inputPointerEntity of pointerQuery()) {
    const inputPointer = getComponent(inputPointerEntity, InputPointerComponent)
    const inputSource = getComponent(inputPointerEntity, InputSourceComponent)

    const cameraEntity = inputPointer.cameraEntity

    const follow = getComponent(cameraEntity, FollowCameraComponent)

    const buttons = InputComponent.getMergedButtons(cameraEntity)
    const axes = InputComponent.getMergedAxes(cameraEntity)

    if (buttons?.PrimaryClick?.pressed) InputState.setCapturingEntity(cameraEntity)

    if (buttons?.FollowCameraModeCycle?.down) onFollowCameraModeCycle(cameraEntity)
    if (buttons?.FollowCameraFirstPerson?.down) onFollowCameraFirstPerson(cameraEntity)
    if (buttons?.FollowCameraShoulderCam?.down) onFollowCameraShoulderCam(cameraEntity)

    const inputState = getState(InputState)

    const pointerDragging = buttons?.PrimaryClick?.dragging

    const target = getOptionalComponent(cameraEntity, TargetCameraRotationComponent) ?? follow

    const [x, z] = getThumbstickOrThumbpadAxes(inputSource.source, inputState.preferredHand)
    target.theta -= x * 2
    target.phi += z * 2

    const keyDelta = (buttons?.ArrowLeft ? 1 : 0) + (buttons?.ArrowRight ? -1 : 0)
    target.theta += 100 * deltaSeconds * keyDelta
    setTargetCameraRotation(cameraEntity, target.phi, target.theta)

    if (pointerDragging) {
      pointerPositionDelta.subVectors(inputPointer.position, inputPointer.lastPosition)
      setTargetCameraRotation(
        cameraEntity,
        target.phi - pointerPositionDelta.y * cameraSettings.cameraRotationSpeed,
        target.theta - pointerPositionDelta.x * cameraSettings.cameraRotationSpeed,
        0.1
      )
    }

    const zoom = axes[MouseScroll.VerticalScroll]
    onFollowCameraZoom(cameraEntity, zoom)
  }
}

export const FollowCameraInputSystem = defineSystem({
  uuid: 'ee.engine.FollowCameraInputSystem',
  insert: { after: InputSystemGroup },
  execute
})
