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

/**
 * @fileoverview
 * Contains function definitions used by ClientInputSystem and other ClientInput related modules
 */

import {
  defineQuery,
  Entity,
  getAncestorWithComponents,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  Not,
  query,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { PI } from '../../common/constants/MathConstants'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { TransformComponent, TransformGizmoTagComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import { ButtonState, ButtonStateMap, createInitialButtonState } from '../state/ButtonState'
import { findProximity, findRaycastedInput, IntersectionData } from './ClientInputHeuristics'

/** radian threshold for rotating state*/
export const ROTATING_THRESHOLD = 1.5 * (PI / 180)

/** squared distance threshold for dragging state */
export const DRAGGING_THRESHOLD = 0.001

export function preventDefault(e) {
  e.preventDefault()
}

export const preventDefaultKeyDown = (evt) => {
  if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
  if (evt.code === 'Tab') evt.preventDefault()
  // prevent DOM tab selection and spacebar/enter button toggling (since it interferes with avatar controls)
  if (evt.code === 'Space' || evt.code === 'Enter') evt.preventDefault()
}

export function updateGamepadInput(eid: Entity) {
  const inputSource = getComponent(eid, InputSourceComponent)
  const gamepad = inputSource.source.gamepad
  const buttons = inputSource.buttons

  if (!gamepad) return
  const gamepadButtons = gamepad.buttons
  if (!gamepadButtons.length) return

  const pointer = getOptionalComponent(eid, InputPointerComponent)
  const xrTransform = getOptionalComponent(eid, TransformComponent)

  for (let i = 0; i < gamepadButtons.length; i++) {
    const gamepadButton = gamepadButtons[i]
    if (!buttons[i] && (gamepadButton.pressed || gamepadButton.touched)) {
      buttons[i] = createInitialButtonState(eid, gamepadButton)
    }
    const buttonState = buttons[i] as ButtonState
    if (buttonState && (gamepadButton.pressed || gamepadButton.touched)) {
      // First frame condition: Initialize downPosition when buttonState.pressed and gamepadButton.pressed are different (aka the first frame)
      if (!buttonState.pressed && gamepadButton.pressed) {
        buttonState.down = true
        if (pointer) {
          buttonState.downPointerPosition = pointer.position.clone()
        }
        if (xrTransform) {
          buttonState.downPosition = xrTransform.position.clone()
          buttonState.downRotation = xrTransform.rotation.clone()
        }
      }
      // Sync buttonState with gamepadButton
      buttonState.pressed = gamepadButton.pressed
      buttonState.touched = gamepadButton.touched
      buttonState.value = gamepadButton.value

      //if not yet dragging, compare distance to drag threshold and begin if appropriate
      if (pointer && buttonState.downPointerPosition && !buttonState.dragging) {
        const squaredDistance = buttonState.downPointerPosition.distanceToSquared(pointer.position)
        buttonState.dragging = squaredDistance > DRAGGING_THRESHOLD
      }

      //if not yet dragging, compare distance to drag threshold and begin if appropriate
      if (xrTransform && buttonState.downPosition && !buttonState.dragging) {
        const squaredDistance = buttonState.downPosition.distanceToSquared(xrTransform.position)
        buttonState.dragging = squaredDistance > DRAGGING_THRESHOLD
      }

      //if not yet rotating, compare distance to drag threshold and begin if appropriate
      if (xrTransform && buttonState.downRotation && !buttonState.rotating) {
        const angleRadians = buttonState.downRotation!.angleTo(xrTransform.rotation)
        buttonState.rotating = angleRadians > ROTATING_THRESHOLD
      }
    } else if (buttonState) {
      buttonState.up = true
    }
  }
}

export const setInputSources = (startEntity: Entity, inputSources: Entity[]) => {
  const inputEntity = getAncestorWithComponents(startEntity, [InputComponent])
  if (!inputEntity) return
  const inputComponent = getComponent(inputEntity, InputComponent)

  for (const sinkEntityUUID of inputComponent.inputSinks) {
    const sinkEntity =
      sinkEntityUUID === 'Self' ? inputEntity : UUIDComponent.getEntityFromSameSourceByID(inputEntity, sinkEntityUUID)
    if (!hasComponent(sinkEntity, InputComponent)) continue
    const sinkInputComponent = getMutableComponent(sinkEntity, InputComponent)
    sinkInputComponent.inputSources.merge(inputSources)
  }
}

export function updatePointerDragging(pointerEntity: Entity, event: PointerEvent) {
  const inputSourceComponent = getOptionalComponent(pointerEntity, InputSourceComponent)
  if (!inputSourceComponent) return

  const pointer = getOptionalComponent(pointerEntity, InputPointerComponent)

  if (!pointer) return

  for (const key of Object.keys(inputSourceComponent.buttons)) {
    const btn = inputSourceComponent.buttons[key] as ButtonState
    if (btn.pressed && btn.downPointerPosition && !btn.dragging) {
      const squaredDistance = btn.downPointerPosition.distanceToSquared(pointer.position)
      if (squaredDistance > DRAGGING_THRESHOLD) {
        btn.dragging = true
      }
    }
  }
}

function _refreshButton(
  key: string,
  buttons: ButtonStateMap<Partial<Record<string | number | symbol, ButtonState | undefined>>>,
  hasFocus: boolean
) {
  const button = buttons[key]
  if (button) {
    if (button.down) button.down = false
    if (button.consumed) button.consumed = UndefinedEntity
    if (!button.up && !hasFocus) {
      button.up = true
    } else if (button.up || !hasFocus) {
      delete buttons[key]
    }
  } else {
    delete buttons[key]
  }
}

function _refreshButtonState(buttonStates: ButtonStateMap<any>, hasFocus: boolean = true) {
  for (const key of Object.keys(buttonStates)) {
    _refreshButton(key, buttonStates, hasFocus)
  }
}

export const redirectPointerEventsToXRUI = (cameraEntity: Entity, evt: PointerEvent) => {
  const pointerEntity = InputPointerComponent.getPointerByID(cameraEntity, evt.pointerId)
  const inputSource = getOptionalComponent(pointerEntity, InputSourceComponent)
  if (!inputSource) return
  for (const i of inputSource.intersections) {
    const entity = i.entity
    const xrui = getOptionalComponent(entity, XRUIComponent)
    if (!xrui) continue
    xrui.updateWorldMatrix(true, true)
    const raycaster = inputSource.raycaster
    const hit = xrui.hitTest(raycaster.ray)
    if (hit && hit.intersection.object.visible) {
      hit.target.dispatchEvent(new (evt.constructor as any)(evt.type, evt))
      hit.target.focus()
      return
    }
  }
}

const nonSpatialInputSource = defineQuery([InputSourceComponent, Not(TransformComponent)])

const sortByDistance = (a: IntersectionData, b: IntersectionData) => {
  // - if a < b
  // + if a > b
  // 0 if equal
  const aNum = hasComponent(a.entity, TransformGizmoTagComponent) ? -1 : 0
  const bNum = hasComponent(b.entity, TransformGizmoTagComponent) ? -1 : 0
  //aNum - bNum : 0 if equal, -1 if a has tag and b doesn't, 1 if a doesnt have tag and b does
  return Math.sign(a.distance - b.distance) + (aNum - bNum)
}

export function assignInputSources(sourceEid: Entity, capturedEntity: Entity) {
  const isSpatialInput = hasComponent(sourceEid, TransformComponent)

  const intersectionData = new Set([] as IntersectionData[])

  if (isSpatialInput) findRaycastedInput(sourceEid, intersectionData)

  const sortedIntersections = Array.from(intersectionData).sort(sortByDistance)
  const sourceState = getMutableComponent(sourceEid, InputSourceComponent)

  //TODO check all inputSources sorted by distance list of InputComponents from query, probably similar to the spatialInputQuery
  //Proximity check ONLY if we have no raycast results, as it is always lower priority
  if (
    capturedEntity === UndefinedEntity &&
    sortedIntersections.length === 0 &&
    !hasComponent(sourceEid, InputPointerComponent)
  ) {
    findProximity(isSpatialInput, sourceEid, sortedIntersections, intersectionData)
  }

  const inputPointerComponent = getOptionalComponent(sourceEid, InputPointerComponent)
  const viewerEntity = inputPointerComponent?.cameraEntity ?? getState(ReferenceSpaceState).viewerEntity
  const camera = getOptionalComponent(viewerEntity, CameraComponent)
  sortedIntersections.push({ entity: viewerEntity, distance: camera?.far ?? 1e16 })

  sourceState.intersections.set(sortedIntersections)

  const finalInputSources = Array.from(new Set([sourceEid, ...nonSpatialInputSource()]))

  if (capturedEntity !== UndefinedEntity) {
    //if we have a capturedEntity, only run on the capturedEntity, not the sortedIntersections
    ClientInputFunctions.setInputSources(capturedEntity, finalInputSources)
  } else {
    if (!sortedIntersections.length) {
      ClientInputFunctions.setInputSources(viewerEntity, finalInputSources)
    } else {
      for (const intersection of sortedIntersections) {
        ClientInputFunctions.setInputSources(intersection.entity, finalInputSources)
      }
    }
  }
}

export function refreshInputs(hasFocus = typeof globalThis.document === 'undefined' ? true : document.hasFocus()) {
  for (const eid of query([InputSourceComponent])) {
    const source = getComponent(eid, InputSourceComponent)
    _refreshButtonState(source.buttons, hasFocus)
    // clear non-spatial emulated axes data end of each frame
    if (!hasComponent(eid, XRSpaceComponent) && hasComponent(eid, InputPointerComponent)) {
      ;(source.source.gamepad!.axes as number[]).fill(0)
    }
  }
  for (const eid of query([InputComponent])) {
    const inputComponent = getComponent(eid, InputComponent)
    _refreshButtonState(inputComponent.cachedButtons, hasFocus)
  }
}

export const ClientInputFunctions = {
  preventDefault,
  preventDefaultKeyDown,
  updateGamepadInput,
  setInputSources,
  updatePointerDragging,
  refreshInputs,
  redirectPointerEventsToXRUI,
  assignInputSources
}
export default ClientInputFunctions
