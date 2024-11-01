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
 * Contains declarations for the functions and hooks used by ClientInputSystem.reactor.
 */

import {
  createEntity,
  Engine,
  Entity,
  getComponent,
  getOptionalComponent,
  removeEntity,
  setComponent,
  useEntityContext
} from '@ir-engine/ecs'
import { getState, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { Vector3 } from 'three'
import { NameComponent } from '../../common/NameComponent'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { EntityTreeComponent, useAncestorWithComponents } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRState } from '../../xr/XRState'
import { DefaultButtonAlias, InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import { AnyButton, ButtonState, ButtonStateMap, createInitialButtonState, MouseButton } from '../state/ButtonState'
import { InputState } from '../state/InputState'
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
      const index = stick === 'LeftStick' ? 0 : 2
      const axes = inputSourceComponent.source.gamepad!.axes as number[]
      axes[index + 0] = value.x
      axes[index + 1] = value.y
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
      setComponent(eid, NameComponent, 'InputSource-gamepad-' + e.gamepad.id)
    }
    const removeGamepad = (e: GamepadEvent) => {
      console.log('[ClientInputSystem] lost gamepad', e.gamepad)
      NameComponent.entitiesByName['InputSource-gamepad-' + e.gamepad.id]?.forEach(removeEntity)
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
      setComponent(eid, InputSourceComponent, { source })
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
      const state = inputSourceComponent.buttons as ButtonStateMap<typeof DefaultButtonAlias>
      state.PrimaryClick = createInitialButtonState(eid)
    }
    const onXRSelectEnd = (event: XRInputSourceEvent) => {
      const eid = InputSourceComponent.entitiesByInputSource.get(event.inputSource)
      if (!eid) return
      const inputSourceComponent = getComponent(eid, InputSourceComponent)
      if (!inputSourceComponent) return
      const state = inputSourceComponent.buttons as ButtonStateMap<typeof DefaultButtonAlias>
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

export const CanvasInputReactor = () => {
  const cameraEntity = useEntityContext()
  const xrState = useMutableState(XRState)
  useEffect(() => {
    if (xrState.session.value) return // pointer input sources are automatically handled by webxr

    const rendererComponent = getComponent(cameraEntity, RendererComponent)
    const canvas = rendererComponent.canvas!

    /** Clear mouse events */
    const pointerButtons = ['PrimaryClick', 'AuxiliaryClick', 'SecondaryClick'] as AnyButton[]
    const clearPointerState = (entity: Entity) => {
      const inputSourceComponent = getComponent(entity, InputSourceComponent)
      const state = inputSourceComponent.buttons
      for (const button of pointerButtons) {
        const val = state[button] as ButtonState
        if (!val?.up && val?.pressed) (state[button] as ButtonState).up = true
      }
    }

    const onPointerEnter = (event: PointerEvent) => {
      const pointerEntity = createEntity()
      setComponent(pointerEntity, NameComponent, 'InputSource-emulated-pointer')
      setComponent(pointerEntity, TransformComponent)
      setComponent(pointerEntity, InputSourceComponent)
      setComponent(pointerEntity, InputPointerComponent, {
        pointerId: event.pointerId,
        cameraEntity
      })
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, event)
    }

    const onPointerOver = (event: PointerEvent) => {
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, event)
    }

    const onPointerOut = (event: PointerEvent) => {
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, event)
    }

    const onPointerLeave = (event: PointerEvent) => {
      const pointerEntity = InputPointerComponent.getPointerByID(cameraEntity, event.pointerId)
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, event)
      removeEntity(pointerEntity)
    }

    const onPointerClick = (event: PointerEvent) => {
      const pointerEntity = InputPointerComponent.getPointerByID(cameraEntity, event.pointerId)
      const inputSourceComponent = getOptionalComponent(pointerEntity, InputSourceComponent)
      if (!inputSourceComponent) return

      const down = event.type === 'pointerdown'

      let button = MouseButton.PrimaryClick
      if (event.button === 1) button = MouseButton.AuxiliaryClick
      else if (event.button === 2) button = MouseButton.SecondaryClick

      const state = inputSourceComponent.buttons as ButtonStateMap<typeof DefaultButtonAlias>
      if (down) {
        state[button] = createInitialButtonState(pointerEntity) //down, pressed, touched = true

        const pointer = getOptionalComponent(pointerEntity, InputPointerComponent)
        if (pointer) {
          state[button]!.downPosition = new Vector3(pointer.position.x, pointer.position.y, 0)
          //rotation will never be defined for the mouse or touch
        }
      } else if (state[button]) {
        state[button]!.up = true
      }

      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, event)
    }

    const onPointerMove = (event: PointerEvent) => {
      const pointerEntity = InputPointerComponent.getPointerByID(cameraEntity, event.pointerId)
      const pointerComponent = getOptionalComponent(pointerEntity, InputPointerComponent)
      if (!pointerComponent) return

      if (document.pointerLockElement === canvas) {
        pointerComponent.position.set(
          pointerComponent.position.x + event.movementX / canvas.clientWidth,
          pointerComponent.position.y - event.movementY / canvas.clientHeight
        )
      } else {
        pointerComponent.position.set(
          ((event.clientX - canvas.getBoundingClientRect().x) / canvas.clientWidth) * 2 - 1,
          ((event.clientY - canvas.getBoundingClientRect().y) / canvas.clientHeight) * -2 + 1
        )
      }
      ClientInputFunctions.updatePointerDragging(pointerEntity, event)
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, event)
    }

    const onVisibilityChange = (event: Event) => {
      if (
        document.visibilityState === 'hidden' ||
        !canvas.checkVisibility({
          checkOpacity: true,
          checkVisibilityCSS: true
        })
      ) {
        InputPointerComponent.getPointersForCamera(cameraEntity).forEach(clearPointerState)
      }
    }

    const onClick = (evt: PointerEvent) => {
      ClientInputFunctions.redirectPointerEventsToXRUI(cameraEntity, evt)
    }

    const onWheelEvent = (event: WheelEvent) => {
      const pointer = InputPointerComponent.getPointersForCamera(cameraEntity)[0]
      if (!pointer) return
      const inputSourceComponent = getComponent(pointer, InputSourceComponent)
      const normalizedValues = normalizeWheel(event)
      const axes = inputSourceComponent.source.gamepad!.axes as number[]
      axes[0] = normalizedValues.spinX
      axes[1] = normalizedValues.spinY
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
    canvas.addEventListener('wheel', onWheelEvent, { passive: true, capture: true })

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
  }, [xrState.session])

  return null
}

export const MeshInputReactor = () => {
  const entity = useEntityContext()
  const shouldReceiveInput = !!useAncestorWithComponents(entity, [InputComponent])

  useImmediateEffect(() => {
    const inputState = getState(InputState)
    if (shouldReceiveInput) inputState.inputMeshes.add(entity)
    else inputState.inputMeshes.delete(entity)
  }, [shouldReceiveInput])
  return null
}

export const BoundingBoxInputReactor = () => {
  const entity = useEntityContext()
  const shouldReceiveInput = !!useAncestorWithComponents(entity, [InputComponent])
  useImmediateEffect(() => {
    const inputState = getState(InputState)
    if (shouldReceiveInput) inputState.inputBoundingBoxes.add(entity)
    else inputState.inputBoundingBoxes.delete(entity)
  }, [shouldReceiveInput])
  return null
}

export const ClientInputHooks = {
  useNonSpatialInputSources,
  useGamepadInputSources,
  useXRInputSources,
  CanvasInputReactor,
  MeshInputReactor,
  BoundingBoxInputReactor
}
export default ClientInputHooks
