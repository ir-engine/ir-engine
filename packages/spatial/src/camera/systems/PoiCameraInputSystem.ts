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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Entity, UUIDComponent, hasComponent, setComponent } from '@ir-engine/ecs'
import { getComponent, getMutableComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { Quaternion, Vector3 } from 'three'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { CameraSettingsState } from '../CameraSettingsState'
import { PoiCameraComponent } from '../components/PoiCameraComponent'
import { CameraScrollBehavior, PoiScrollTransition } from '../types/CameraMode'

const targetPosition = new Vector3()
const targetRotation = new Quaternion()

/**
 * Handle POI camera scroll navigation.
 * @param cameraEntity Entity holding camera and POI camera component.
 * @param zoomDelta Scroll input delta.
 */
export const handlePoiCameraScroll = (cameraEntity: Entity, zoomDelta: number): void => {
  const poiCamera = getMutableComponent(cameraEntity, PoiCameraComponent)
  const cameraSettingsState = getMutableState(CameraSettingsState)

  if (cameraSettingsState.poiEntities.length === 0) return

  if (poiCamera.targetPoiIndex.value < 0) {
    poiCamera.targetPoiIndex.set(0)
    poiCamera.currentPoiIndex.set(0)
    poiCamera.poiLerpValue.set(0)
    poiCamera.scrollAccumulator.set(0)
  }

  const transitionType = cameraSettingsState.poiScrollTransitionType.value
  const scrollBehavior = cameraSettingsState.scrollBehavior.value

  if (transitionType === PoiScrollTransition.Snapping) {
    // In snapping mode, disable scrolling while transitioning
    if (poiCamera.isTransitioning.value) return

    if (Math.abs(zoomDelta) > 0.1) {
      const direction = zoomDelta > 0 ? 1 : -1
      let newTargetIndex = poiCamera.targetPoiIndex.value + direction

      if (scrollBehavior === CameraScrollBehavior.Wrap) {
        newTargetIndex =
          ((newTargetIndex % cameraSettingsState.poiEntities.length) + cameraSettingsState.poiEntities.length) %
          cameraSettingsState.poiEntities.length
      } else {
        newTargetIndex = Math.max(0, Math.min(newTargetIndex, cameraSettingsState.poiEntities.length - 1))
      }

      if (newTargetIndex !== poiCamera.targetPoiIndex.value) {
        poiCamera.targetPoiIndex.set(newTargetIndex)
        poiCamera.poiLerpValue.set(0)
        poiCamera.isTransitioning.set(true)
      }
    }
  }
  // Scrolling mode - continuous smooth navigation
  else {
    const scrollSensitivity = cameraSettingsState.scrollSensitivity.value
    const scrollDistancePerPoi = cameraSettingsState.scrollDistancePerPoi.value
    const scrollDeadzone = cameraSettingsState.scrollDeadzone.value

    const newScrollAccumulator = poiCamera.scrollAccumulator.value + zoomDelta * scrollSensitivity

    const rawTargetIndex = newScrollAccumulator / Math.max(0.001, scrollDistancePerPoi)
    let targetIndex = Math.floor(rawTargetIndex)

    if (scrollBehavior === CameraScrollBehavior.Wrap) {
      targetIndex =
        ((targetIndex % cameraSettingsState.poiEntities.length) + cameraSettingsState.poiEntities.length) %
        cameraSettingsState.poiEntities.length
    } else {
      targetIndex = Math.max(0, Math.min(targetIndex, cameraSettingsState.poiEntities.length - 1))
    }

    const segmentProgress = rawTargetIndex - Math.floor(rawTargetIndex)
    const distanceFromCenter = Math.abs(segmentProgress - 0.5)

    let lerpValue = 0
    if (distanceFromCenter > scrollDeadzone / 2) {
      const adjustedDistance = (distanceFromCenter - scrollDeadzone / 2) / (0.5 - scrollDeadzone / 2)
      lerpValue = Math.min(adjustedDistance, 1)
      if (segmentProgress < 0.5) lerpValue = -lerpValue
    }

    poiCamera.scrollAccumulator.set(newScrollAccumulator)
    poiCamera.currentPoiIndex.set(targetIndex)

    const nextIndex = targetIndex + (lerpValue > 0 ? 1 : -1)
    let wrappedNextIndex = nextIndex
    if (scrollBehavior === CameraScrollBehavior.Wrap) {
      wrappedNextIndex =
        ((nextIndex % cameraSettingsState.poiEntities.length) + cameraSettingsState.poiEntities.length) %
        cameraSettingsState.poiEntities.length
    } else {
      wrappedNextIndex = Math.max(0, Math.min(nextIndex, cameraSettingsState.poiEntities.length - 1))
    }

    poiCamera.targetPoiIndex.set(wrappedNextIndex)
    poiCamera.poiLerpValue.set(Math.abs(lerpValue))
  }
}

const execute = () => {
  const viewerEntity = getState(ReferenceSpaceState).viewerEntity
  if (!hasComponent(viewerEntity, PoiCameraComponent)) return

  const axes = InputComponent.getAxes(viewerEntity)
  const zoomDelta = axes.FollowCameraZoomScroll ?? 0

  // Handle POI camera scroll input
  if (Math.abs(zoomDelta) > 0.01) {
    handlePoiCameraScroll(viewerEntity, zoomDelta)
  }

  const poiCamera = getComponent(viewerEntity, PoiCameraComponent)
  const settings = getMutableState(CameraSettingsState)

  if (settings.poiEntities.length > 0) {
    // Filter POI entities to only include those with PoiComponent

    if (settings.poiEntities.length > 0) {
      const currentIndex = Math.max(0, Math.min(poiCamera.currentPoiIndex, settings.poiEntities.length - 1))
      const targetIndex = Math.max(0, Math.min(poiCamera.targetPoiIndex, settings.poiEntities.length - 1))

      const currentPoiEntity = UUIDComponent.getEntityByUUID(settings.poiEntities[currentIndex].value)
      const targetPoiEntity = UUIDComponent.getEntityByUUID(settings.poiEntities[targetIndex].value)

      const currentPoiTransform = currentPoiEntity ? getComponent(currentPoiEntity, TransformComponent) : null
      const targetPoiTransform = targetPoiEntity ? getComponent(targetPoiEntity, TransformComponent) : null

      if (currentPoiTransform && targetPoiTransform) {
        const currentPoiPosition = new Vector3().copy(currentPoiTransform.position)
        const targetPoiPosition = new Vector3().copy(targetPoiTransform.position)

        const lerpValue = poiCamera.poiLerpValue
        targetPosition.lerpVectors(currentPoiPosition, targetPoiPosition, lerpValue)
        targetRotation.slerpQuaternions(currentPoiTransform.rotation, targetPoiTransform.rotation, lerpValue)
        setComponent(viewerEntity, TransformComponent, { position: targetPosition, rotation: targetRotation })

        if (settings.poiScrollTransitionType.value === PoiScrollTransition.Snapping) {
          const poiCameraMutable = getMutableComponent(viewerEntity, PoiCameraComponent)
          const lerpSpeed = settings.poiLerpSpeed.value
          const deltaTime = getState(ECSState).deltaSeconds

          if (poiCameraMutable.isTransitioning.value) {
            const newLerpValue = Math.min(lerpValue + lerpSpeed * deltaTime, 1)
            poiCameraMutable.poiLerpValue.set(newLerpValue)

            if (newLerpValue >= 1) {
              poiCameraMutable.currentPoiIndex.set(poiCameraMutable.targetPoiIndex.value)
              poiCameraMutable.poiLerpValue.set(0)
              poiCameraMutable.isTransitioning.set(false)
            }
          }
        }
      }
    }
  }
}

export const PoiCameraInputSystem = defineSystem({
  uuid: 'ee.engine.PoiCameraInputSystem',
  insert: { after: InputSystemGroup },
  execute
})
