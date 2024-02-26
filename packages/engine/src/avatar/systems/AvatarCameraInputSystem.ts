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

import { getComponent, getOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { throttle } from '@etherealengine/spatial/src/common/functions/FunctionHelpers'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { getThumbstickOrThumbpadAxes } from '../../avatar/systems/AvatarInputSystem'

import { XRState } from '@etherealengine/spatial/src/xr/XRState'

import { InputState } from '@etherealengine/spatial/src/input/state/InputState'

import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { InputSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { CameraSettings } from '@etherealengine/spatial/src/camera/CameraState'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@etherealengine/spatial/src/camera/components/TargetCameraRotationComponent'
import { handleCameraZoom, setTargetCameraRotation } from '@etherealengine/spatial/src/camera/functions/CameraFunctions'
import { switchCameraMode } from '@etherealengine/spatial/src/camera/functions/switchCameraMode'
import { CameraMode } from '@etherealengine/spatial/src/camera/types/CameraMode'
import { isMobile } from '@etherealengine/spatial/src/common/functions/isMobile'
import { InputPointerComponent } from '@etherealengine/spatial/src/input/components/InputPointerComponent'

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
const INPUT_CAPTURE_DELAY = 0.1
let accumulator = 0

const throttleHandleCameraZoom = throttle(handleCameraZoom, 30, { leading: true, trailing: false })
let capturedInputSource: Entity | undefined = undefined
const lastPointerPosition = new Vector2()
const pointerMovement = new Vector2()

const pointers = defineQuery([InputPointerComponent])

const execute = () => {
  if (getState(XRState).xrFrame) return

  const deltaSeconds = getState(ECSState).deltaSeconds
  accumulator += deltaSeconds

  const { localClientEntity } = Engine.instance
  if (!localClientEntity) return

  const cameraSettings = getState(CameraSettings)

  const avatarControllerEntities = avatarControllerQuery()

  let inputPointerEntity = pointers()[0]
  if (!inputPointerEntity && capturedInputSource) {
    inputPointerEntity = capturedInputSource
  }

  const inputSource = getOptionalComponent(inputPointerEntity, InputSourceComponent)
  const inputPointer = getOptionalComponent(inputPointerEntity, InputPointerComponent)

  const keys = inputSource?.buttons

  if (keys?.KeyV?.down) onKeyV()
  if (keys?.KeyF?.down) onKeyF()
  if (keys?.KeyC?.down) onKeyC()

  if (!inputPointer) return

  const inputState = getState(InputState)
  pointerMovement.subVectors(inputPointer.position, lastPointerPosition)
  lastPointerPosition.copy(inputPointer.position)

  const mouseMoved = isMobile
    ? pointerMovement.lengthSq() > 0 && keys?.PrimaryClick?.pressed
    : keys?.PrimaryClick?.pressed

  for (const entity of avatarControllerEntities) {
    if (!inputSource) continue

    const avatarController = getComponent(entity, AvatarControllerComponent)
    const cameraEntity = avatarController.cameraEntity
    const target =
      getOptionalComponent(cameraEntity, TargetCameraRotationComponent) ??
      getOptionalComponent(cameraEntity, FollowCameraComponent)
    if (!target) continue

    if (!lastMouseMoved && mouseMoved) lastLookDelta.set(inputPointer.position.x, inputPointer.position.y)

    const [x, z] = getThumbstickOrThumbpadAxes(inputSource.source, inputState.preferredHand)
    target.theta -= x * 2
    target.phi += z * 2

    const keyDelta = (keys?.ArrowLeft ? 1 : 0) + (keys?.ArrowRight ? -1 : 0)
    target.theta += 100 * deltaSeconds * keyDelta
    setTargetCameraRotation(cameraEntity, target.phi, target.theta)

    if (mouseMoved) {
      setTargetCameraRotation(
        cameraEntity,
        target.phi - (inputPointer.position.y - lastLookDelta.y) * cameraSettings.cameraRotationSpeed,
        target.theta - (inputPointer.position.x - lastLookDelta.x) * cameraSettings.cameraRotationSpeed,
        0.1
      )
    }
    if (keys?.PrimaryClick?.pressed) {
      if (accumulator > INPUT_CAPTURE_DELAY) {
        InputSourceComponent.captureButtons(cameraEntity)
        capturedInputSource = inputPointerEntity
        accumulator = 0
      }
    } else {
      InputSourceComponent.releaseButtons()
      capturedInputSource = undefined
      accumulator = 0
    }
    throttleHandleCameraZoom(cameraEntity, inputState.scroll.y)
  }

  lastLookDelta.set(inputPointer.position.x, inputPointer.position.y)

  lastMouseMoved = !!mouseMoved
}

export const AvatarCameraInputSystem = defineSystem({
  uuid: 'ee.engine.AvatarCameraInputSystem',
  insert: { with: InputSystemGroup },
  execute
})
