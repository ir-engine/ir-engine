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
 * @param cameraEntity Entity holding camera and POI camera component.
 * Handle Guided camera scroll navigation.
 * @param zoomDelta Scroll input delta.
 */
export const handlePoiCameraScroll = (cameraEntity: Entity, zoomDelta: number): void => {
  const poiCamera = getMutableComponent(cameraEntity, PoiCameraComponent)
  const cameraSettingsState = getMutableState(CameraSettingsState)

  if (poiCamera.targetPoiIndex < 0) {
    poiCamera.targetPoiIndex = 0
    poiCamera.currentPoiIndex = 0
    poiCamera.poiLerpValue = 0
    poiCamera.scrollAccumulator = 0
  }
  poiCamera.isTransitioning = poiCamera.poiLerpValue < 1

  if (cameraSettingsState.poiEntities.value.length === 0 || Math.abs(zoomDelta) < 0.01) return

  const deadzone = cameraSettingsState.scrollDeadzone.value
  const scrollDistancePerPoi = cameraSettingsState.scrollDistancePerPoi.value
  const scrollBehavior = cameraSettingsState.scrollBehavior.value
  const transitionType = cameraSettingsState.poiScrollTransitionType.value
  const scrollSensitivity = cameraSettingsState.scrollSensitivity.value

  if (transitionType === PoiScrollTransition.Snapping) {
    if (poiCamera.isTransitioning && poiCamera.targetPoiIndex !== poiCamera.currentPoiIndex) return
    // Snap navigation: single scroll increment changes target POI
    const currentTargetIndex = poiCamera.targetPoiIndex
    let newTargetIndex = currentTargetIndex

    // Determine scroll direction and update target index
    if (zoomDelta > 0) {
      newTargetIndex = currentTargetIndex + 1
    } else if (zoomDelta < 0) {
      newTargetIndex = currentTargetIndex - 1
    }

    // Handle wrapping or clamping for the new target index
    if (scrollBehavior === CameraScrollBehavior.Wrap) {
      newTargetIndex =
        ((newTargetIndex % cameraSettingsState.poiEntities.value.length) +
          cameraSettingsState.poiEntities.value.length) %
        cameraSettingsState.poiEntities.value.length
    } else {
      newTargetIndex = Math.max(0, Math.min(cameraSettingsState.poiEntities.value.length - 1, newTargetIndex))
    }

    // Only update if the target index actually changed
    if (newTargetIndex !== currentTargetIndex) {
      poiCamera.targetPoiIndex = newTargetIndex
      poiCamera.currentPoiIndex = currentTargetIndex // Keep current as the starting point
      poiCamera.poiLerpValue = 0 // Reset lerp to start transition
    }
  }
  // Scrolling mode - continuous smooth navigation
  else {
    const currentScrollPosition = poiCamera.scrollAccumulator

    const adjustedScrollPosition = applySmoothDeadzone(
      zoomDelta * scrollSensitivity,
      currentScrollPosition,
      cameraSettingsState.poiEntities.value.length,
      scrollDistancePerPoi,
      deadzone,
      true
    )

    if (scrollBehavior === CameraScrollBehavior.Wrap) {
      // Wrap behavior - allow infinite scrolling with wrapping
      const totalScrollRange = cameraSettingsState.poiEntities.value.length * scrollDistancePerPoi

      // Normalize scroll position to wrap around using modulo
      const normalizedScrollPosition =
        ((adjustedScrollPosition % totalScrollRange) + totalScrollRange) % totalScrollRange
      poiCamera.scrollAccumulator = normalizedScrollPosition

      const result = calculatePoiState(
        normalizedScrollPosition,
        true,
        scrollDistancePerPoi,
        cameraSettingsState.poiEntities.value.length
      )
      poiCamera.currentPoiIndex = result.currentIndex
      poiCamera.targetPoiIndex = result.targetIndex
      poiCamera.poiLerpValue = result.lerpValue
    } else {
      // Clamp behavior - stop at boundaries
      const totalScrollRange = (cameraSettingsState.poiEntities.value.length - 1) * scrollDistancePerPoi

      // Clamp scroll position to valid range
      const clampedScrollPosition = Math.max(0, Math.min(totalScrollRange, adjustedScrollPosition))
      poiCamera.scrollAccumulator = clampedScrollPosition

      const result = calculatePoiState(
        clampedScrollPosition,
        false,
        scrollDistancePerPoi,
        cameraSettingsState.poiEntities.value.length
      )
      poiCamera.currentPoiIndex = result.currentIndex
      poiCamera.targetPoiIndex = result.targetIndex
      poiCamera.poiLerpValue = result.lerpValue
    }
  }
}

const calculatePoiState = (
  scrollPosition: number,
  isWrapping: boolean,
  scrollDistancePerPoi: number,
  poiCount: number
) => {
  // Find which POI segment we're in
  const rawPoiSegment = scrollPosition / scrollDistancePerPoi
  const basePoiIndex = Math.floor(rawPoiSegment)
  const segmentProgress = rawPoiSegment - basePoiIndex

  let currentIndex = basePoiIndex
  let targetIndex = basePoiIndex + 1
  let lerpValue = segmentProgress

  // Handle wrapping or clamping for indices
  if (isWrapping) {
    currentIndex = ((currentIndex % poiCount) + poiCount) % poiCount
    targetIndex = ((targetIndex % poiCount) + poiCount) % poiCount
  } else {
    currentIndex = Math.max(0, Math.min(poiCount - 1, currentIndex))
    targetIndex = Math.max(0, Math.min(poiCount - 1, targetIndex))

    // Handle edge case at the last POI
    if (currentIndex >= poiCount - 1) {
      currentIndex = poiCount - 1
      targetIndex = poiCount - 1
      lerpValue = 1
    }
  }

  return { currentIndex, targetIndex, lerpValue: Math.max(0, Math.min(1, lerpValue)) }
}

const applySmoothDeadzone = (
  scrollDelta: number,
  scrollPosition: number,
  poiCount: number,
  scrollDistancePerPoi: number,
  deadzone: number,
  isWrapping: boolean
) => {
  // Find the nearest POI target position
  const rawPoiSegment = scrollPosition / scrollDistancePerPoi
  const nearestPoiIndex = Math.round(rawPoiSegment)
  const nearestPoiPosition = nearestPoiIndex * scrollDistancePerPoi

  // Calculate distance from the nearest POI center
  let distanceFromCenter = Math.abs(scrollPosition - nearestPoiPosition)

  // For wrapping, we need to consider the wrapped distance as well
  if (isWrapping) {
    const totalScrollRange = poiCount * scrollDistancePerPoi
    distanceFromCenter = Math.min(distanceFromCenter, totalScrollRange - distanceFromCenter)
  }

  // Calculate the scroll speed multiplier based on distance from POI center
  // Use a gentle curve that reduces speed near the center but maintains minimum movement
  const halfDeadzone = deadzone / 2
  let speedMultiplier = 1.0

  if (distanceFromCenter < halfDeadzone) {
    // Inside the deadzone - apply gentle curve
    // Use a gentler quadratic curve with minimum speed: 0.2 + 0.8 * (distance / halfDeadzone)^2
    const normalizedDistance = distanceFromCenter / halfDeadzone
    const minSpeed = 0.1 // Minimum speed multiplier (20% of normal speed)
    const speedRange = 0.9 // Range from min to full speed
    speedMultiplier = minSpeed + speedRange * Math.pow(normalizedDistance, 2)
  }

  // Apply the speed multiplier to the scroll delta
  const adjustedScrollDelta = scrollDelta * speedMultiplier
  return scrollPosition + adjustedScrollDelta
}

const execute = () => {
  const viewerEntity = getState(ReferenceSpaceState).viewerEntity

  const axes = InputComponent.getAxes(viewerEntity)
  const zoomDelta = axes.FollowCameraZoomScroll ?? 0
  if (!hasComponent(viewerEntity, PoiCameraComponent)) return
  // Handle Guided camera scroll input
  if (Math.abs(zoomDelta) > 0.01) {
    handlePoiCameraScroll(viewerEntity, zoomDelta)
  }

  const poiCamera = getComponent(viewerEntity, PoiCameraComponent)
  const settings = getMutableState(CameraSettingsState)

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

        if (poiCameraMutable.isTransitioning) {
          const newLerpValue = Math.min(lerpValue + lerpSpeed * deltaTime, 1)
          poiCameraMutable.poiLerpValue = newLerpValue

          if (newLerpValue >= 1) {
            poiCameraMutable.currentPoiIndex = poiCameraMutable.targetPoiIndex
            poiCameraMutable.poiLerpValue = 0
            poiCameraMutable.isTransitioning = false
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
