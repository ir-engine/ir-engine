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

import {
  defineSystem,
  Engine,
  Entity,
  EntityTreeComponent,
  PresentationSystemGroup,
  QueryReactor
} from '@ir-engine/ecs'
import {
  getOptionalComponent,
  Layers,
  removeEntity,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs/src/ComponentFunctions'
import { createXRUI } from '@ir-engine/engine/src/xrui/createXRUI'
import { getState, useMutableState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { CameraSettingsState } from '@ir-engine/spatial/src/camera/CameraSettingsState'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { PoiCameraComponent } from '@ir-engine/spatial/src/camera/components/PoiCameraComponent'
import { CameraScrollBehavior, PoiScrollTransition } from '@ir-engine/spatial/src/camera/types/CameraMode'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import { ObjectFitFunctions } from '@ir-engine/spatial/src/transform/functions/ObjectFitFunctions'
import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

// @ts-ignore
import base from '@ir-engine/client/src/themes/base.css?inline'
// @ts-ignore
import components from '@ir-engine/client/src/themes/components.css?inline'
// @ts-ignore
import utilities from '@ir-engine/client/src/themes/utilities.css?inline'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'

export const PoiUiSystem = defineSystem({
  uuid: 'ee.engine.PoiUiSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => (
    <QueryReactor Components={[PoiCameraComponent]} ChildEntityReactor={PoiReactor} layer={Layers.Simulation} />
  )
})

const PoiReactor = () => {
  const entity = useEntityContext()

  useEffect(() => {
    const xrui = createPoiUI(entity)
    setComponent(xrui.entity, EntityTreeComponent, {
      parentEntity: Engine.instance.originEntity
    })

    const { viewerEntity } = getState(ReferenceSpaceState)
    setComponent(xrui.entity, ComputedTransformComponent, {
      referenceEntities: [viewerEntity],
      computeFunction: () => {
        const camera = getOptionalComponent(viewerEntity, CameraComponent)
        if (!camera) return
        const distance = camera.near * 1.1 // 10% in front of camera
        const scale = 0.137
        ObjectFitFunctions.attachObjectInFrontOfCamera(xrui.entity, scale, distance)
      }
    })

    return () => {
      if (!xrui.entity) return
      removeEntity(xrui.entity)
    }
  }, [])
  return null
}

export const createPoiUI = (entity: Entity, aspectRatio: number = 1) => {
  const PoiUi = () => <PoiUiView entity={entity} />
  const ui = createXRUI(PoiUi, null, { interactable: false })
  setComponent(ui.entity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
  setComponent(ui.entity, NameComponent, 'poi-ui-' + entity)
  return ui
}

type PoiUiProps = {
  entity: Entity
}

const PoiUiView = (props: PoiUiProps) => {
  const poiCamera = useComponent(props.entity, PoiCameraComponent)
  const cameraSettingsState = useMutableState(CameraSettingsState)

  // State for reactive boolean variables
  const [showPrevious, setShowPrevious] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [buttonsDisabled, setButtonsDisabled] = useState(false)

  const [canvasWidth, setCanvasWidth] = useState(0)
  const [canvasHeight, setCanvasHeight] = useState(0)

  const rendererComponent = useComponent(getState(ReferenceSpaceState).viewerEntity, RendererComponent)

  useEffect(() => {
    if (!rendererComponent.canvas.value) return
    setCanvasWidth(rendererComponent.canvas.value.clientWidth)
    setCanvasHeight(rendererComponent.canvas.value.clientHeight)
  }, [
    rendererComponent.canvas,
    rendererComponent.needsResize,
    rendererComponent.canvas.value?.clientWidth,
    rendererComponent.canvas.value?.clientHeight
  ])

  const previousClicked = () => {
    const transitionType = cameraSettingsState.poiScrollTransitionType.value
    const scrollBehavior = cameraSettingsState.scrollBehavior.value
    const currentTargetIndex = poiCamera.targetPoiIndex.value
    const poiCount = cameraSettingsState.poiEntities.length

    let newTargetIndex = currentTargetIndex - 1

    // Handle wrapping or clamping
    if (scrollBehavior === CameraScrollBehavior.Wrap) {
      newTargetIndex = ((newTargetIndex % poiCount) + poiCount) % poiCount
    } else {
      newTargetIndex = Math.max(0, newTargetIndex)
    }

    if (transitionType === PoiScrollTransition.Snapping) {
      // Snap mode: set target and reset lerp
      poiCamera.targetPoiIndex.set(newTargetIndex)
      poiCamera.currentPoiIndex.set(currentTargetIndex) // Keep current as starting point
      poiCamera.poiLerpValue.set(0) // Reset lerp to start transition
    } else {
      // Scrolling mode: directly set current index (legacy behavior)
      poiCamera.currentPoiIndex.set(newTargetIndex)
    }
  }

  const nextClicked = () => {
    const transitionType = cameraSettingsState.poiScrollTransitionType.value
    const scrollBehavior = cameraSettingsState.scrollBehavior.value
    const currentTargetIndex = poiCamera.targetPoiIndex.value
    const poiCount = cameraSettingsState.poiEntities.length

    let newTargetIndex = currentTargetIndex + 1

    // Handle wrapping or clamping
    if (scrollBehavior === CameraScrollBehavior.Wrap) {
      newTargetIndex = ((newTargetIndex % poiCount) + poiCount) % poiCount
    } else {
      newTargetIndex = Math.min(poiCount - 1, newTargetIndex)
    }

    if (transitionType === PoiScrollTransition.Snapping) {
      // Snap mode: set target and reset lerp
      poiCamera.targetPoiIndex.set(newTargetIndex)
      poiCamera.currentPoiIndex.set(currentTargetIndex) // Keep current as starting point
      poiCamera.poiLerpValue.set(0) // Reset lerp to start transition
    } else {
      // Scrolling mode: directly set current index (legacy behavior)
      poiCamera.currentPoiIndex.set(newTargetIndex)
    }
  }

  useEffect(() => {
    const scrollBehavior = cameraSettingsState.scrollBehavior.value
    const activeIndex = poiCamera.currentPoiIndex.value

    // Update button visibility based on scroll behavior
    setShowPrevious(scrollBehavior === CameraScrollBehavior.Wrap || activeIndex > 0)
    setShowNext(
      scrollBehavior === CameraScrollBehavior.Wrap || activeIndex < cameraSettingsState.poiEntities.length - 1
    )
  }, [poiCamera.currentPoiIndex.value, cameraSettingsState.poiEntities.length])

  // Check if buttons should be disabled during snapping transitions
  useEffect(() => {
    const transitionType = cameraSettingsState.poiScrollTransitionType.value
    const isSnappingMode = transitionType === PoiScrollTransition.Snapping
    const isTransitionActive = isSnappingMode && poiCamera.poiLerpValue.value > 0 && poiCamera.poiLerpValue.value < 1

    setButtonsDisabled(isTransitionActive)
  }, [cameraSettingsState.poiScrollTransitionType.value, poiCamera.poiLerpValue.value])

  // Don't show buttons if they're disabled
  if (!cameraSettingsState.enableTransitionButtons.value) {
    return null
  }

  return (
    <>
      <style type="text/css">{components}</style>
      <style type="text/css">{utilities}</style>
      <style type="text/css">{base}</style>

      <div style={{ height: canvasHeight, width: canvasWidth }} className={`flex flex-row `}>
        <div className="flex h-full w-1/2 items-center justify-start">
          {showPrevious && (
            <button
              xr-layer="true"
              className={`pointer-events-auto ml-4 flex h-12 w-12 items-center justify-center rounded-md ${
                buttonsDisabled
                  ? 'cursor-not-allowed bg-gray-400 text-gray-600 opacity-50'
                  : 'bg-ui-background text-text-primary-button hover:bg-gray-200'
              }`}
              onClick={buttonsDisabled ? undefined : previousClicked}
              disabled={buttonsDisabled}
            >
              <FaArrowLeft className={buttonsDisabled ? 'text-gray-600' : 'text-black'} />
            </button>
          )}
        </div>
        <div className="flex h-full w-1/2 items-center justify-end">
          {showNext && (
            <button
              xr-layer="true"
              className={`pointer-events-auto mr-4 flex h-12 w-12 items-center justify-center rounded-md ${
                buttonsDisabled
                  ? 'cursor-not-allowed bg-gray-400 text-gray-600 opacity-50'
                  : 'bg-ui-background text-text-primary-button hover:bg-gray-200'
              }`}
              onClick={buttonsDisabled ? undefined : nextClicked}
              disabled={buttonsDisabled}
            >
              <FaArrowRight className={buttonsDisabled ? 'text-gray-600' : 'text-black'} />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
