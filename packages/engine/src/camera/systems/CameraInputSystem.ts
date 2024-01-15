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

import { getState } from '@etherealengine/hyperflux'

import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { AvatarInputSettingsState } from '../../avatar/state/AvatarInputSettingsState'
import { getThumbstickOrThumbpadAxes } from '../../avatar/systems/AvatarInputSystem'
import { throttle } from '../../common/functions/FunctionHelpers'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, getOptionalComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'

import { XRState } from '../../xr/XRState'

import { InputState } from '../../input/state/InputState'

import { isMobile } from '../../common/functions/isMobile'
import { InputSystemGroup } from '../../ecs/functions/EngineFunctions'
import { CameraSettings } from '../CameraState'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'
import { handleCameraZoom, setTargetCameraRotation } from '../functions/CameraFunctions'
import { CameraMode } from '../types/CameraMode'

const avatarControllerQuery = defineQuery([AvatarControllerComponent])

const onKeyV = () => {
  for (const entity of avatarControllerQuery()) {
    const avatarController = getComponent(entity, AvatarControllerComponent)
    const cameraEntity = avatarController.cameraEntity
    const followComponent = getOptionalComponent(cameraEntity, FollowCameraComponent)
    if (followComponent)
      switch (followComponent.mode) {
        case CameraMode.FirstPerson:
          switchCameraMode(entity, { cameraMode: CameraMode.ShoulderCam })
          break
        case CameraMode.ShoulderCam:
          switchCameraMode(entity, { cameraMode: CameraMode.ThirdPerson })
          followComponent.distance = followComponent.minDistance + 1
          break
        case CameraMode.ThirdPerson:
          switchCameraMode(entity, { cameraMode: CameraMode.TopDown })
          break
        case CameraMode.TopDown:
          switchCameraMode(entity, { cameraMode: CameraMode.FirstPerson })
          break
        default:
          break
      }
  }
}

const onKeyF = () => {
  for (const entity of avatarControllerQuery()) {
    const avatarController = getComponent(entity, AvatarControllerComponent)
    const cameraEntity = avatarController.cameraEntity
    const followComponent = getOptionalComponent(cameraEntity, FollowCameraComponent)
    if (followComponent && followComponent.mode !== CameraMode.FirstPerson) {
      followComponent.locked = !followComponent.locked
    }
  }
}

const onKeyC = () => {
  for (const entity of avatarControllerQuery()) {
    const avatarController = getComponent(entity, AvatarControllerComponent)
    const cameraEntity = avatarController.cameraEntity
    const followComponent = getOptionalComponent(cameraEntity, FollowCameraComponent)
    if (followComponent) followComponent.shoulderSide = !followComponent.shoulderSide
  }
}

const lastLookDelta = new Vector2()
let lastMouseMoved = false
const INPUT_CAPTURE_DELAY = 0.2
let accumulator = 0

const throttleHandleCameraZoom = throttle(handleCameraZoom, 30, { leading: true, trailing: false })
let capturedInputSource: Entity | undefined = undefined
const execute = () => {
  if (getState(XRState).xrFrame) return

  const deltaSeconds = getState(EngineState).deltaSeconds
  accumulator += deltaSeconds

  const { localClientEntity } = Engine.instance
  if (!localClientEntity) return

  const cameraSettings = getState(CameraSettings)

  const avatarControllerEntities = avatarControllerQuery()

  let inputSourceEntity = InputSourceComponent.nonCapturedInputSourceQuery()[0]
  if (!inputSourceEntity && capturedInputSource) {
    inputSourceEntity = capturedInputSource
  }

  const avatarInputSettings = getState(AvatarInputSettingsState)

  const inputSource = getComponent(inputSourceEntity, InputSourceComponent)

  const keys = inputSource?.buttons

  if (keys?.KeyV?.down) onKeyV()
  if (keys?.KeyF?.down) onKeyF()
  if (keys?.KeyC?.down) onKeyC()

  const pointerState = getState(InputState).pointerState
  const mouseMoved = isMobile
    ? pointerState.movement.lengthSq() > 0 && keys?.PrimaryClick?.pressed
    : keys?.PrimaryClick?.pressed

  for (const entity of avatarControllerEntities) {
    if (!inputSource) continue

    const avatarController = getComponent(entity, AvatarControllerComponent)
    const cameraEntity = avatarController.cameraEntity
    const target =
      getOptionalComponent(cameraEntity, TargetCameraRotationComponent) ??
      getOptionalComponent(cameraEntity, FollowCameraComponent)
    if (!target) continue

    if (!lastMouseMoved && mouseMoved) lastLookDelta.set(pointerState.position.x, pointerState.position.y)

    if (
      (inputSource.source.gamepad?.mapping === 'standard' || inputSource.source.gamepad?.mapping === '') &&
      inputSource.source.handedness === 'none'
    ) {
      const [x, z] = getThumbstickOrThumbpadAxes(inputSource.source, avatarInputSettings.preferredHand)
      target.theta -= x * 2
      target.phi += z * 2
    }

    const keyDelta = (keys?.ArrowLeft ? 1 : 0) + (keys?.ArrowRight ? -1 : 0)
    target.theta += 100 * deltaSeconds * keyDelta
    setTargetCameraRotation(cameraEntity, target.phi, target.theta)

    if (mouseMoved) {
      setTargetCameraRotation(
        cameraEntity,
        target.phi - (pointerState.position.y - lastLookDelta.y) * cameraSettings.cameraRotationSpeed,
        target.theta - (pointerState.position.x - lastLookDelta.x) * cameraSettings.cameraRotationSpeed,
        0.1
      )
    }
    if (keys?.PrimaryClick?.pressed) {
      if (accumulator > INPUT_CAPTURE_DELAY) {
        InputSourceComponent.captureButtons(cameraEntity)
        capturedInputSource = inputSourceEntity
        accumulator = 0
      }
    } else {
      InputSourceComponent.releaseButtons()
      capturedInputSource = undefined
      accumulator = 0
    }
    throttleHandleCameraZoom(cameraEntity, pointerState.scroll.y)
  }

  lastLookDelta.set(pointerState.position.x, pointerState.position.y)

  lastMouseMoved = !!mouseMoved
}

export const CameraInputSystem = defineSystem({
  uuid: 'ee.engine.CameraInputSystem',
  insert: { with: InputSystemGroup },
  execute
})
