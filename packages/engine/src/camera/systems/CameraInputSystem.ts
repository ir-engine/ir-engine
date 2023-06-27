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

import { clamp } from 'lodash'
import { Vector2 } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { throttle } from '../../common/functions/FunctionHelpers'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  ComponentType,
  defineQuery,
  getComponent,
  getOptionalComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { getFirstNonCapturedInputSource, InputSourceComponent } from '../../input/components/InputSourceComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { CameraSettings } from '../CameraState'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'
import { CameraMode } from '../types/CameraMode'

export const setTargetCameraRotation = (entity: Entity, phi: number, theta: number, time = 0.3) => {
  const cameraRotationTransition = getOptionalComponent(entity, TargetCameraRotationComponent) as
    | ComponentType<typeof TargetCameraRotationComponent>
    | undefined
  if (!cameraRotationTransition) {
    setComponent(entity, TargetCameraRotationComponent, {
      phi: phi,
      phiVelocity: { value: 0 },
      theta: theta,
      thetaVelocity: { value: 0 },
      time: time
    })
  } else {
    cameraRotationTransition.phi = phi
    cameraRotationTransition.theta = theta
    cameraRotationTransition.time = time
  }
}

let lastScrollValue = 0

/**
 * Change camera distance.
 * @param cameraEntity Entity holding camera and input component.
 */
export const handleCameraZoom = (cameraEntity: Entity, value: number): void => {
  const scrollDelta = Math.sign(value - lastScrollValue) * 0.5
  lastScrollValue = value

  if (scrollDelta === 0) {
    return
  }

  const followComponent = getOptionalComponent(cameraEntity, FollowCameraComponent) as
    | ComponentType<typeof FollowCameraComponent>
    | undefined

  if (!followComponent) {
    return
  }

  const epsilon = 0.001
  const nextZoomLevel = clamp(followComponent.zoomLevel + scrollDelta, epsilon, followComponent.maxDistance)

  // Move out of first person mode
  if (followComponent.zoomLevel <= epsilon && scrollDelta > 0) {
    followComponent.zoomLevel = followComponent.minDistance
    return
  }

  // Move to first person mode
  if (nextZoomLevel < followComponent.minDistance) {
    followComponent.zoomLevel = epsilon
    setTargetCameraRotation(cameraEntity, 0, followComponent.theta)
    return
  }

  // Rotate camera to the top but let the player rotate if he/she desires
  if (Math.abs(followComponent.maxDistance - nextZoomLevel) <= 1.0 && scrollDelta > 0) {
    setTargetCameraRotation(cameraEntity, 85, followComponent.theta)
  }

  // Rotate from top
  if (
    Math.abs(followComponent.maxDistance - followComponent.zoomLevel) <= 1.0 &&
    scrollDelta < 0 &&
    followComponent.phi >= 80
  ) {
    setTargetCameraRotation(cameraEntity, 45, followComponent.theta)
  }

  followComponent.zoomLevel = nextZoomLevel
}

const avatarControllerQuery = defineQuery([LocalInputTagComponent, AvatarControllerComponent])

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

const throttleHandleCameraZoom = throttle(handleCameraZoom, 30, { leading: true, trailing: false })

const execute = () => {
  if (Engine.instance.xrFrame) return

  const { localClientEntity, deltaSeconds } = Engine.instance
  if (!localClientEntity) return

  const cameraSettings = getState(CameraSettings)

  const avatarControllerEntities = avatarControllerQuery()

  const nonCapturedInputSource = getFirstNonCapturedInputSource()
  if (!nonCapturedInputSource) return

  const inputSource = getComponent(nonCapturedInputSource, InputSourceComponent)

  const keys = inputSource.buttons

  if (keys.KeyV?.down) onKeyV()
  if (keys.KeyF?.down) onKeyF()
  if (keys.KeyC?.down) onKeyC()

  const mouseMoved = Engine.instance.pointerState.movement.lengthSq() > 0 && keys.PrimaryClick?.pressed

  for (const entity of avatarControllerEntities) {
    const avatarController = getComponent(entity, AvatarControllerComponent)
    const cameraEntity = avatarController.cameraEntity
    const target =
      getOptionalComponent(cameraEntity, TargetCameraRotationComponent) ??
      getOptionalComponent(cameraEntity, FollowCameraComponent)
    if (!target) continue

    if (!lastMouseMoved && mouseMoved)
      lastLookDelta.set(Engine.instance.pointerState.position.x, Engine.instance.pointerState.position.y)

    const keyDelta = (keys.ArrowLeft ? 1 : 0) + (keys.ArrowRight ? -1 : 0)
    target.theta += 100 * deltaSeconds * keyDelta
    setTargetCameraRotation(cameraEntity, target.phi, target.theta)

    if (mouseMoved) {
      setTargetCameraRotation(
        cameraEntity,
        target.phi - (Engine.instance.pointerState.position.y - lastLookDelta.y) * cameraSettings.cameraRotationSpeed,
        target.theta - (Engine.instance.pointerState.position.x - lastLookDelta.x) * cameraSettings.cameraRotationSpeed,
        0.1
      )
    }

    throttleHandleCameraZoom(cameraEntity, Engine.instance.pointerState.scroll.y)
  }

  lastLookDelta.set(Engine.instance.pointerState.position.x, Engine.instance.pointerState.position.y)

  lastMouseMoved = !!mouseMoved
}

export const CameraInputSystem = defineSystem({
  uuid: 'ee.engine.CameraInputSystem',
  execute
})
