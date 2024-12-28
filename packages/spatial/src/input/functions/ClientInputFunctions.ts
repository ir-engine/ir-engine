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
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  Not,
  UndefinedEntity,
  UUIDComponent
} from '@ir-engine/ecs'
import { Quaternion, Vector3 } from 'three'
import { PI, Q_IDENTITY, Vector3_Zero } from '../../common/constants/MathConstants'
import { getAncestorWithComponents } from '../../transform/components/EntityTree'
import { TransformComponent, TransformGizmoTagComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { DefaultButtonAlias, InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import { ButtonState, ButtonStateMap, createInitialButtonState, MouseButton } from '../state/ButtonState'
import { findProximity, findRaycastedInput, IntersectionData } from './ClientInputHeuristics'

/** radian threshold for rotating state*/
export const ROTATING_THRESHOLD = 1.5 * (PI / 180)

/** squared distance threshold for dragging state */
export const DRAGGING_THRESHOLD = 0.001

/** anti-garbage variable!! value not to be used unless you set values just before use*/
const _pointerPositionVector3 = new Vector3()

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
  // const buttonDownPos = inputSource.buttonDownPositions as WeakMap<AnyButton, Vector3>
  // log buttons
  // if (source.gamepad) {
  //   for (let i = 0; i < source.gamepad.buttons.length; i++) {
  //     const button = source.gamepad.buttons[i]
  //     if (button.pressed) console.log('button ' + i + ' pressed: ' + button.pressed)
  //   }
  // }

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
        buttonState.downPosition = new Vector3()
        buttonState.downRotation = new Quaternion()

        if (pointer) {
          buttonState.downPosition.set(pointer.position.x, pointer.position.y, 0)
          //TODO maybe map pointer rotation/swing/twist to downRotation here once we map the pointer events to that (think Apple pencil)
        } else if (hasComponent(eid, XRSpaceComponent) && xrTransform) {
          buttonState.downPosition.copy(xrTransform.position)
          buttonState.downRotation.copy(xrTransform.rotation)
        }
      }
      // Sync buttonState with gamepadButton
      buttonState.pressed = gamepadButton.pressed
      buttonState.touched = gamepadButton.touched
      buttonState.value = gamepadButton.value

      if (buttonState.downPosition) {
        //if not yet dragging, compare distance to drag threshold and begin if appropriate
        if (!buttonState.dragging) {
          if (pointer) _pointerPositionVector3.set(pointer.position.x, pointer.position.y, 0)
          // Will always be 0 on the first frame: downPosition will be set this frame, and therefore checked against itself
          const squaredDistance = buttonState.downPosition.distanceToSquared(
            pointer ? _pointerPositionVector3 : xrTransform?.position ?? Vector3_Zero
          )
          buttonState.dragging = squaredDistance > DRAGGING_THRESHOLD
        }

        //if not yet rotating, compare distance to drag threshold and begin if appropriate
        if (!buttonState.rotating) {
          const angleRadians = buttonState.downRotation!.angleTo(
            pointer ? Q_IDENTITY : xrTransform?.rotation ?? Q_IDENTITY
          )
          buttonState.rotating = angleRadians > ROTATING_THRESHOLD
        }
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
    const sinkEntity = sinkEntityUUID === 'Self' ? inputEntity : UUIDComponent.getEntityByUUID(sinkEntityUUID) //TODO why is this not sending input to my sinks
    const sinkInputComponent = getMutableComponent(sinkEntity, InputComponent)
    sinkInputComponent.inputSources.merge(inputSources)
  }
}

export function updatePointerDragging(pointerEntity: Entity, event: PointerEvent) {
  const inputSourceComponent = getOptionalComponent(pointerEntity, InputSourceComponent)
  if (!inputSourceComponent) return

  const state = inputSourceComponent.buttons as ButtonStateMap<typeof DefaultButtonAlias>

  let button = MouseButton.PrimaryClick
  if (event.type === 'pointermove') {
    if ((event as MouseEvent).button === 1) button = MouseButton.AuxiliaryClick
    else if ((event as MouseEvent).button === 2) button = MouseButton.SecondaryClick
  }
  const btn = state[button]
  if (!btn || btn.dragging) return

  const pointer = getOptionalComponent(pointerEntity, InputPointerComponent)

  if (!btn.pressed || !btn.downPosition) return

  //if not yet dragging, compare distance to drag threshold and begin if appropriate
  pointer
    ? _pointerPositionVector3.set(pointer.position.x, pointer.position.y, 0)
    : _pointerPositionVector3.copy(Vector3_Zero)
  const squaredDistance = btn.downPosition.distanceToSquared(_pointerPositionVector3)

  if (squaredDistance > DRAGGING_THRESHOLD) {
    btn.dragging = true
  }
}

export function cleanupButton(
  key: string,
  buttons: ButtonStateMap<Partial<Record<string | number | symbol, ButtonState | undefined>>>,
  hasFocus: boolean
) {
  const button = buttons[key]
  if (button?.down) button.down = false
  if (button?.up || !hasFocus) delete buttons[key]
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

export function assignInputSources(sourceEid: Entity, capturedEntity: Entity) {
  const isSpatialInput = hasComponent(sourceEid, TransformComponent)

  const intersectionData = new Set([] as IntersectionData[])

  if (isSpatialInput) findRaycastedInput(sourceEid, intersectionData)

  const sortedIntersections = Array.from(intersectionData).sort((a, b) => {
    // - if a < b
    // + if a > b
    // 0 if equal
    const aNum = hasComponent(a.entity, TransformGizmoTagComponent) ? -1 : 0
    const bNum = hasComponent(b.entity, TransformGizmoTagComponent) ? -1 : 0
    //aNum - bNum : 0 if equal, -1 if a has tag and b doesn't, 1 if a doesnt have tag and b does
    return Math.sign(a.distance - b.distance) + (aNum - bNum)
  })
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
  if (inputPointerComponent) {
    sortedIntersections.push({ entity: inputPointerComponent.cameraEntity, distance: 0 })
  }

  sourceState.intersections.set(sortedIntersections)

  const finalInputSources = Array.from(new Set([sourceEid, ...nonSpatialInputSource()]))

  //if we have a capturedEntity, only run on the capturedEntity, not the sortedIntersections
  if (capturedEntity !== UndefinedEntity) {
    ClientInputFunctions.setInputSources(capturedEntity, finalInputSources)
  } else {
    for (const intersection of sortedIntersections) {
      ClientInputFunctions.setInputSources(intersection.entity, finalInputSources)
    }
  }
}

export const ClientInputFunctions = {
  preventDefault,
  preventDefaultKeyDown,
  updateGamepadInput,
  setInputSources,
  updatePointerDragging,
  cleanupButton,
  redirectPointerEventsToXRUI,
  assignInputSources
}
export default ClientInputFunctions
