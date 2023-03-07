import { clamp } from 'lodash'
import { useEffect } from 'react'
import { Vector2 } from 'three'

import { getMutableState, startReactor, useHookstate } from '@etherealengine/hyperflux'

import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { throttle } from '../../common/functions/FunctionHelpers'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentType,
  defineQuery,
  getComponent,
  getOptionalComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { getCameraMode } from '../../xr/XRState'
import { CameraSettings } from '../CameraState'
import { FollowCameraComponent } from '../components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '../components/TargetCameraRotationComponent'
import { CameraMode } from '../types/CameraMode'

export const setTargetCameraRotation = (entity: Entity, phi: number, theta: number, time = 0.3) => {
  const cameraRotationTransition = getOptionalComponent(entity, TargetCameraRotationComponent) as
    | ComponentType<typeof TargetCameraRotationComponent>
    | undefined
  if (!cameraRotationTransition) {
    addComponent(entity, TargetCameraRotationComponent, {
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

export default async function CameraInputSystem() {
  const cameraSettings = getMutableState(CameraSettings)

  const inputQuery = defineQuery([LocalInputTagComponent, AvatarControllerComponent])

  const onKeyV = () => {
    for (const entity of inputQuery()) {
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
    for (const entity of inputQuery()) {
      const avatarController = getComponent(entity, AvatarControllerComponent)
      const cameraEntity = avatarController.cameraEntity
      const followComponent = getOptionalComponent(cameraEntity, FollowCameraComponent)
      if (followComponent && followComponent.mode !== CameraMode.FirstPerson) {
        followComponent.locked = !followComponent.locked
      }
    }
  }

  const onKeyC = () => {
    for (const entity of inputQuery()) {
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

    const keys = Engine.instance.buttons
    if (keys.KeyV?.down) onKeyV()
    if (keys.KeyF?.down) onKeyF()
    if (keys.KeyC?.down) onKeyC()

    const inputEntities = inputQuery()
    const mouseMoved = Engine.instance.pointerState.movement.lengthSq() > 0 && keys.PrimaryClick?.pressed

    for (const entity of inputEntities) {
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
          target.phi -
            (Engine.instance.pointerState.position.y - lastLookDelta.y) * cameraSettings.cameraRotationSpeed.value,
          target.theta -
            (Engine.instance.pointerState.position.x - lastLookDelta.x) * cameraSettings.cameraRotationSpeed.value,
          0.1
        )
      }

      throttleHandleCameraZoom(cameraEntity, Engine.instance.pointerState.scroll.y)
    }

    lastLookDelta.set(Engine.instance.pointerState.position.x, Engine.instance.pointerState.position.y)

    lastMouseMoved = !!mouseMoved
  }

  const cleanup = async () => {
    removeQuery(inputQuery)
  }

  return { execute, cleanup }
}
