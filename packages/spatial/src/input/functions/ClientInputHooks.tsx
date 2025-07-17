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

/**
 * @fileoverview
 * Contains declarations for the functions and hooks used by ClientInputSystem.reactor.
 */

import {
  createEntity,
  Engine,
  Entity,
  EntityID,
  EntityTreeComponent,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent,
  SourceID,
  UndefinedEntity,
  useComponent,
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import { useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { Vector2 } from 'three'
import { NameComponent } from '../../common/NameComponent'
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRState } from '../../xr/XRState'
import { DefaultButtonBindings } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import {
  AnyButton,
  ButtonState,
  ButtonStateMap,
  createInitialButtonState,
  MouseButton,
  MouseScroll,
  XRStandardGamepadAxes
} from '../state/ButtonState'
import ClientInputFunctions from './ClientInputFunctions'
import normalizeWheel from './normalizeWheel'

export const useNonSpatialInputSources = () => {
  useEffect(() => {
    const eid = createEntity()
    setComponent(eid, InputSourceComponent, {})
    setComponent(eid, NameComponent, 'InputSource-nonspatial')
    const inputSourceComponent = getComponent(eid, InputSourceComponent)

    document.addEventListener('DOMMouseScroll', ClientInputFunctions.preventDefault, false)
    document.addEventListener('gesturestart', ClientInputFunctions.preventDefault)
    document.addEventListener('keydown', ClientInputFunctions.preventDefaultKeyDown, false)

    const onKeyEvent = (event: KeyboardEvent) => {
      ClientInputFunctions.preventDefaultKeyDown(event)
      const element = event.target as HTMLElement
      // Сheck which excludes the possibility of controlling the avatar when typing in a text field
      if (element?.tagName === 'INPUT' || element?.tagName === 'SELECT' || element?.tagName === 'TEXTAREA') return

      const code = event.code
      const down = event.type === 'keydown'

      const buttonState = inputSourceComponent.buttons
      if (down) buttonState[code] = createInitialButtonState(eid)
      else if (buttonState[code]) buttonState[code].up = true
    }
    document.addEventListener('keyup', onKeyEvent)
    document.addEventListener('keydown', onKeyEvent)

    const handleTouchDirectionalPad = (event: CustomEvent): void => {
      const { stick, value }: { stick: 'LeftStick' | 'RightStick'; value: { x: number; y: number } } = event.detail
      if (!stick) return
      const axes = inputSourceComponent.source.gamepad!.axes as number[]
      axes[XRStandardGamepadAxes.XRStandardGamepadThumbstickX] = value.x
      axes[XRStandardGamepadAxes.XRStandardGamepadThumbstickY] = value.y
    }
    document.addEventListener('touchstickmove', handleTouchDirectionalPad)

    const handleTouchGamepadButtonDown = (event: CustomEvent) => {
      const buttonState = inputSourceComponent.buttons
      buttonState[event.detail.button] = createInitialButtonState(eid)
    }
    document.addEventListener('touchgamepadbuttondown', handleTouchGamepadButtonDown)

    const handleTouchGamepadButtonUp = (event: CustomEvent) => {
      const buttonState = inputSourceComponent.buttons
      if (buttonState[event.detail.button]) buttonState[event.detail.button].up = true
    }
    document.addEventListener('touchgamepadbuttonup', handleTouchGamepadButtonUp)

    return () => {
      document.removeEventListener('DOMMouseScroll', ClientInputFunctions.preventDefault, false)
      document.removeEventListener('gesturestart', ClientInputFunctions.preventDefault)
      document.removeEventListener('keyup', onKeyEvent)
      document.removeEventListener('keydown', onKeyEvent)
      document.removeEventListener('keydown', ClientInputFunctions.preventDefaultKeyDown, false)
      document.removeEventListener('touchstickmove', handleTouchDirectionalPad)
      document.removeEventListener('touchgamepadbuttondown', handleTouchGamepadButtonDown)
      document.removeEventListener('touchgamepadbuttonup', handleTouchGamepadButtonUp)
      removeEntity(eid)
    }
  }, [])
}

export const useGamepadInputSources = () => {
  useEffect(() => {
    const addGamepad = (e: GamepadEvent) => {
      console.log('[ClientInputSystem] found gamepad', e.gamepad)
      const eid = createEntity()
      setComponent(eid, InputSourceComponent, { gamepad: e.gamepad })
      setComponent(eid, UUIDComponent, {
        entitySourceID: 'InputSource-gamepad' as SourceID,
        entityID: e.gamepad.id as EntityID
      })
    }
    const removeGamepad = (e: GamepadEvent) => {
      console.log('[ClientInputSystem] lost gamepad', e.gamepad)
      const entity = UUIDComponent.getEntityByUUID(
        UUIDComponent.join({ entitySourceID: 'InputSource-gamepad' as SourceID, entityID: e.gamepad.id as EntityID })
      )
      removeEntity(entity)
    }
    window.addEventListener('gamepadconnected', addGamepad)
    window.addEventListener('gamepaddisconnected', removeGamepad)
    return () => {
      window.removeEventListener('gamepadconnected', addGamepad)
      window.removeEventListener('gamepaddisconnected', removeGamepad)
    }
  }, [])
}

export const useXRInputSources = () => {
  const xrState = useMutableState(XRState)

  useEffect(() => {
    const session = xrState.session.value
    if (!session) return

    const addInputSource = (source: XRInputSource) => {
      const eid = createEntity()
      setComponent(eid, InputSourceComponent, { source, sourceEntity: Engine.instance.viewerEntity })
      setComponent(eid, EntityTreeComponent, {
        parentEntity:
          source.targetRayMode === 'tracked-pointer' ? Engine.instance.localFloorEntity : Engine.instance.viewerEntity
      })
      setComponent(eid, TransformComponent)
      setComponent(eid, NameComponent, 'InputSource-handed:' + source.handedness + '-mode:' + source.targetRayMode)
    }

    const removeInputSource = (source: XRInputSource) => {
      const entity = InputSourceComponent.entitiesByInputSource.get(source)
      if (entity) removeEntity(entity)
    }

    if (session.inputSources) {
      for (const inputSource of session.inputSources) addInputSource(inputSource)
    }

    const onInputSourcesChanged = (event: XRInputSourceChangeEvent) => {
      event.added.map(addInputSource)
      event.removed.map(removeInputSource)
    }

    const onXRSelectStart = (event: XRInputSourceEvent) => {
      const eid = InputSourceComponent.entitiesByInputSource.get(event.inputSource)
      if (!eid) return
      const inputSourceComponent = getComponent(eid, InputSourceComponent)
      if (!inputSourceComponent) return
      const state = inputSourceComponent.buttons as ButtonStateMap<typeof DefaultButtonBindings>
      state.PrimaryClick = createInitialButtonState(eid)
    }
    const onXRSelectEnd = (event: XRInputSourceEvent) => {
      const eid = InputSourceComponent.entitiesByInputSource.get(event.inputSource)
      if (!eid) return
      const inputSourceComponent = getComponent(eid, InputSourceComponent)
      if (!inputSourceComponent) return
      const state = inputSourceComponent.buttons as ButtonStateMap<typeof DefaultButtonBindings>
      if (!state.PrimaryClick) return
      state.PrimaryClick.up = true
    }

    session.addEventListener('inputsourceschange', onInputSourcesChanged)
    session.addEventListener('selectstart', onXRSelectStart)
    session.addEventListener('selectend', onXRSelectEnd)

    return () => {
      session.removeEventListener('inputsourceschange', onInputSourcesChanged)
      session.removeEventListener('selectstart', onXRSelectStart)
      session.removeEventListener('selectend', onXRSelectEnd)
    }
  }, [xrState.session])
}

const emulatedInputPointerEntityName = 'InputSource-emulated-pointer'
const EMULATED_POINTER_ID_BASE = 1000 // Start from a high number to avoid conflicts with real pointer IDs

export const CanvasInputReactor = () => {
  const cameraEntity = useEntityContext()
  const xrState = useMutableState(XRState)
  const rendererComponent = useComponent(cameraEntity, RendererComponent)

  useEffect(() => {
    if (xrState.session.value) return // pointer input sources are automatically handled by webxr

    const canvas = rendererComponent.canvas as HTMLCanvasElement
    if (!canvas) return

    // Map browser pointer IDs to our emulated pointer IDs
    const pointerIdMap = new Map<number, number>()
    let nextEmulatedPointerId = EMULATED_POINTER_ID_BASE + 1

    /** Clear mouse events */
    const pointerButtons = ['PrimaryClick', 'AuxiliaryClick', 'SecondaryClick'] as AnyButton[]
    const clearPointerState = (entity: Entity) => {
      if (entity === UndefinedEntity) return
      const inputSourceComponent = getOptionalComponent(entity, InputSourceComponent)
      if (inputSourceComponent) {
        const state = inputSourceComponent.buttons
        for (const button of pointerButtons) {
          const val = state[button] as ButtonState
          if (!val?.up && val?.pressed) (state[button] as ButtonState).up = true
        }
      }
    }

    const getMappedPointerId = (browserPointerId: number): number => {
      if (!pointerIdMap.has(browserPointerId)) {
        // For single-touch scenarios, use consistent base ID to maintain compatibility
        if (pointerIdMap.size === 0) {
          pointerIdMap.set(browserPointerId, EMULATED_POINTER_ID_BASE)
        } else {
          // For multi-touch, assign unique IDs to track each touch independently
          pointerIdMap.set(browserPointerId, nextEmulatedPointerId++)
        }
      }
      return pointerIdMap.get(browserPointerId)!
    }

    const removeMappedPointerId = (browserPointerId: number) => {
      pointerIdMap.delete(browserPointerId)
    }

    const clonePointerEventWithNewId = (originalEvent: PointerEvent, newPointerId: number): PointerEvent => {
      const eventType = originalEvent.type

      const newEventInit = {
        bubbles: originalEvent.bubbles,
        cancelable: originalEvent.cancelable,
        composed: originalEvent.composed,

        pointerId: newPointerId,
        pointerType: originalEvent.pointerType,
        width: originalEvent.width,
        height: originalEvent.height,
        pressure: originalEvent.pressure,
        tangentialPressure: originalEvent.tangentialPressure,
        tiltX: originalEvent.tiltX,
        tiltY: originalEvent.tiltY,
        twist: originalEvent.twist,
        isPrimary: originalEvent.isPrimary,

        clientX: originalEvent.clientX,
        clientY: originalEvent.clientY,
        screenX: originalEvent.screenX,
        screenY: originalEvent.screenY,
        pageX: originalEvent.pageX,
        pageY: originalEvent.pageY,
        offsetX: originalEvent.offsetX,
        offsetY: originalEvent.offsetY,
        movementX: originalEvent.movementX,
        movementY: originalEvent.movementY,

        button: originalEvent.button,
        buttons: originalEvent.buttons,
        ctrlKey: originalEvent.ctrlKey,
        shiftKey: originalEvent.shiftKey,
        altKey: originalEvent.altKey,
        metaKey: originalEvent.metaKey,

        view: originalEvent.view,
        relatedTarget: originalEvent.relatedTarget
      }

      return new PointerEvent(eventType, newEventInit)
    }

    const onPointerEnter = (event: PointerEvent) => {
      const mappedPointEvent = clonePointerEventWithNewId(event, getMappedPointerId(event.pointerId))

      const existingPointerEntity = InputPointerComponent.getPointerByID(cameraEntity, mappedPointEvent.pointerId)
      const pointerEntity =
        existingPointerEntity !== UndefinedEntity
          ? existingPointerEntity
          : (() => {
              const entity = createEntity()
              setComponent(entity, NameComponent, emulatedInputPointerEntityName)
              setComponent(entity, TransformComponent)
              setComponent(entity, InputSourceComponent, { sourceEntity: cameraEntity })
              setComponent(entity, InputPointerComponent, {
                pointerId: mappedPointEvent.pointerId,
                cameraEntity
              })
              return entity
            })()

      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, mappedPointEvent)
    }

    const onPointerOver = (event: PointerEvent) => {
      const mappedPointEvent = clonePointerEventWithNewId(event, getMappedPointerId(event.pointerId))
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, mappedPointEvent)
    }

    const onPointerOut = (event: PointerEvent) => {
      const mappedPointEvent = clonePointerEventWithNewId(event, getMappedPointerId(event.pointerId))
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, mappedPointEvent)
    }

    const onPointerLeave = (event: PointerEvent) => {
      const mappedPointEvent = clonePointerEventWithNewId(event, getMappedPointerId(event.pointerId))
      const pointerEntity = InputPointerComponent.getPointerByID(cameraEntity, mappedPointEvent.pointerId)
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, mappedPointEvent)
      clearPointerState(pointerEntity)

      removeMappedPointerId(event.pointerId)

      // Reset counter if no active touches to maintain single-touch consistency
      if (pointerIdMap.size === 0) {
        nextEmulatedPointerId = EMULATED_POINTER_ID_BASE + 1
      }
    }

    const onPointerClick = (event: PointerEvent) => {
      const mappedPointEvent = clonePointerEventWithNewId(event, getMappedPointerId(event.pointerId))
      const pointerEntity = InputPointerComponent.getPointerByID(cameraEntity, mappedPointEvent.pointerId)
      const inputSourceComponent = getOptionalComponent(pointerEntity, InputSourceComponent)
      if (!inputSourceComponent) {
        removeMappedPointerId(event.pointerId)
        return
      }

      const down = mappedPointEvent.type === 'pointerdown'

      try {
        if (down) canvas.setPointerCapture(mappedPointEvent.pointerId)
        else canvas.releasePointerCapture(mappedPointEvent.pointerId)
      } catch (e) {
        //
      }

      let button: MouseButton = MouseButton.PrimaryClick
      if (mappedPointEvent.button === 1) button = MouseButton.AuxiliaryClick
      else if (mappedPointEvent.button === 2) button = MouseButton.SecondaryClick

      const state = inputSourceComponent.buttons as ButtonStateMap<typeof DefaultButtonBindings>
      if (down) {
        state[button] = createInitialButtonState(pointerEntity) //down, pressed, touched = true

        const pointer = getOptionalComponent(pointerEntity, InputPointerComponent)
        if (pointer && document.pointerLockElement !== canvas) {
          state[button]!.downPointerPosition = new Vector2(pointer.position.x, pointer.position.y)
          pointer.position.set(
            ((mappedPointEvent.clientX - canvas.getBoundingClientRect().x) / canvas.clientWidth) * 2 - 1,
            ((mappedPointEvent.clientY - canvas.getBoundingClientRect().y) / canvas.clientHeight) * -2 + 1
          )
        }
      } else if (state[button]) {
        state[button]!.up = true
        removeMappedPointerId(event.pointerId)
      }

      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, mappedPointEvent)
    }

    const onPointerMove = (event: PointerEvent) => {
      const mappedPointEvent = clonePointerEventWithNewId(event, getMappedPointerId(event.pointerId))
      const pointerEntity = InputPointerComponent.getPointerByID(cameraEntity, mappedPointEvent.pointerId)
      const pointerComponent = getOptionalComponent(pointerEntity, InputPointerComponent)
      if (!pointerComponent) return

      if (document.pointerLockElement === canvas) {
        pointerComponent.position.set(
          pointerComponent.position.x + mappedPointEvent.movementX / canvas.clientWidth,
          pointerComponent.position.y - mappedPointEvent.movementY / canvas.clientHeight
        )
      } else {
        pointerComponent.position.set(
          ((mappedPointEvent.clientX - canvas.getBoundingClientRect().x) / canvas.clientWidth) * 2 - 1,
          ((mappedPointEvent.clientY - canvas.getBoundingClientRect().y) / canvas.clientHeight) * -2 + 1
        )
      }
      ClientInputFunctions.updatePointerDragging(pointerEntity, mappedPointEvent)
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, mappedPointEvent)
    }

    const onVisibilityChange = (event: Event) => {
      if (
        !document.hasFocus() ||
        document.hidden ||
        document.visibilityState === 'hidden' ||
        !canvas.checkVisibility({
          checkOpacity: true,
          checkVisibilityCSS: true
        })
      ) {
        InputPointerComponent.getPointersForCamera(cameraEntity).forEach(clearPointerState)
      }
    }

    const onClick = (event: PointerEvent) => {
      const mappedPointEvent = clonePointerEventWithNewId(event, getMappedPointerId(event.pointerId))
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, mappedPointEvent)
      removeMappedPointerId(event.pointerId)
    }

    const onWheelEvent = (event: WheelEvent) => {
      const pointer = InputPointerComponent.getPointersForCamera(cameraEntity)[0]
      if (!pointer) return
      const inputSourceComponent = getComponent(pointer, InputSourceComponent)
      const normalizedValues = normalizeWheel(event)
      const axes = inputSourceComponent.source.gamepad!.axes as number[]
      axes[MouseScroll.HorizontalScroll] = normalizedValues.spinX
      axes[MouseScroll.VerticalScroll] = normalizedValues.spinY
      event.preventDefault()
      event.stopPropagation()
    }

    canvas.addEventListener('dragstart', ClientInputFunctions.preventDefault, false)
    canvas.addEventListener('contextmenu', ClientInputFunctions.preventDefault)
    canvas.addEventListener('pointerenter', onPointerEnter)
    canvas.addEventListener('pointerover', onPointerOver)
    canvas.addEventListener('pointerout', onPointerOut)
    canvas.addEventListener('pointerleave', onPointerLeave)
    canvas.addEventListener('pointermove', onPointerMove, { passive: true, capture: true })
    canvas.addEventListener('pointerup', onPointerClick)
    canvas.addEventListener('pointerdown', onPointerClick)
    canvas.addEventListener('blur', onVisibilityChange)
    canvas.addEventListener('visibilitychange', onVisibilityChange)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('wheel', onWheelEvent, { passive: false, capture: true })

    return () => {
      canvas.removeEventListener('dragstart', ClientInputFunctions.preventDefault, false)
      canvas.removeEventListener('contextmenu', ClientInputFunctions.preventDefault)
      canvas.removeEventListener('pointerenter', onPointerEnter)
      canvas.removeEventListener('pointerover', onPointerOver)
      canvas.removeEventListener('pointerout', onPointerOut)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerClick)
      canvas.removeEventListener('pointerdown', onPointerClick)
      canvas.removeEventListener('blur', onVisibilityChange)
      canvas.removeEventListener('visibilitychange', onVisibilityChange)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('wheel', onWheelEvent)
    }
  }, [xrState.session, rendererComponent.canvas])

  return null
}

export const ClientInputHooks = {
  useNonSpatialInputSources,
  useGamepadInputSources,
  useXRInputSources,
  CanvasInputReactor
}
export default ClientInputHooks
