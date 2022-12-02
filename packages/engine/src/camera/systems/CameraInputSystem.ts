import { clamp } from 'lodash'
import { useEffect } from 'react'

import { getState, startReactor, useHookstate } from '@xrengine/hyperflux'

import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { switchCameraMode } from '../../avatar/functions/switchCameraMode'
import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { throttle } from '../../common/functions/FunctionHelpers'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  ComponentType,
  defineQuery,
  getComponent,
  getOptionalComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { BaseInput } from '../../input/enums/BaseInput'
import { ButtonInputState } from '../../input/InputState'
import { InputBehaviorType } from '../../input/interfaces/InputSchema'
import { InputValue } from '../../input/interfaces/InputValue'
import { InputAlias } from '../../input/types/InputAlias'
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

export const setCameraRotation: InputBehaviorType = (
  entity: Entity,
  inputKey: InputAlias,
  inputValue: InputValue
): void => {
  const { deltaSeconds: delta } = Engine.instance.currentWorld

  const cameraEntity = Engine.instance.currentWorld.cameraEntity
  const followComponent = getComponent(cameraEntity, FollowCameraComponent) as ComponentType<
    typeof FollowCameraComponent
  >

  if (!followComponent) return

  switch (inputKey) {
    case BaseInput.CAMERA_ROTATE_LEFT:
      followComponent.theta += 100 * delta
      break
    case BaseInput.CAMERA_ROTATE_RIGHT:
      followComponent.theta -= 100 * delta
      break
  }
  setTargetCameraRotation(cameraEntity, followComponent.phi, followComponent.theta)
}

export default async function CameraInputSystem(world: World) {
  const keyState = getState(ButtonInputState)

  const inputQuery = defineQuery([LocalInputTagComponent, AvatarControllerComponent])

  const reactor = startReactor(() => {
    const keys = useHookstate(keyState)

    useEffect(() => {
      if (keys.KeyV?.value)
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
    }, [keys.KeyV])

    useEffect(() => {
      if (keys.KeyF?.value)
        for (const entity of inputQuery()) {
          const avatarController = getComponent(entity, AvatarControllerComponent)
          const cameraEntity = avatarController.cameraEntity
          const followComponent = getOptionalComponent(cameraEntity, FollowCameraComponent)
          if (followComponent && followComponent.mode !== CameraMode.FirstPerson) {
            followComponent.locked = !followComponent.locked
          }
        }
    }, [keys.KeyF])

    useEffect(() => {
      if (keys.KeyC?.value)
        for (const entity of inputQuery()) {
          const avatarController = getComponent(entity, AvatarControllerComponent)
          const cameraEntity = avatarController.cameraEntity
          const followComponent = getOptionalComponent(cameraEntity, FollowCameraComponent)
          if (followComponent) followComponent.shoulderSide = !followComponent.shoulderSide
        }
    }, [keys.KeyC])

    return null
  })

  const throttleHandleCameraZoom = throttle(handleCameraZoom, 30, { leading: true, trailing: false })

  const execute = () => {
    const { inputSources } = world

    const inputEntities = inputQuery()

    for (const inputSource of inputSources) {
      const gamepad = inputSource.gamepad
      if ((gamepad?.mapping as any) === 'dom') {
        for (const entity of inputEntities) {
          const avatarController = getComponent(entity, AvatarControllerComponent)
          const cameraEntity = avatarController.cameraEntity
          const followComponent = getOptionalComponent(cameraEntity, FollowCameraComponent)
          if (followComponent) throttleHandleCameraZoom(cameraEntity, gamepad!.axes[4])
        }
      }
    }
  }

  const cleanup = () => {
    reactor.stop()
    removeQuery(world, inputQuery)
  }

  return { execute, cleanup }
}
