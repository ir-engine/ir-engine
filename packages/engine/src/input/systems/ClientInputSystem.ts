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

import { useEffect } from 'react'
import { Mesh, MeshBasicMaterial, Quaternion, Ray, Raycaster, Vector3 } from 'three'

import { dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { CameraComponent } from '../../camera/components/CameraComponent'
import { ObjectDirection } from '../../common/constants/Axis3D'
import { Object3DUtils } from '../../common/functions/Object3DUtils'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { InteractState } from '../../interaction/systems/InteractiveSystem'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { AllCollisionMask } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { GroupComponent, Object3DWithEntity } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { ReferenceSpace, XRState } from '../../xr/XRState'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { InputComponent } from '../components/InputComponent'
import {
  InputSourceAxesCapturedComponent,
  InputSourceButtonsCapturedComponent,
  InputSourceComponent
} from '../components/InputSourceComponent'
import normalizeWheel from '../functions/normalizeWheel'
import { ButtonStateMap, MouseButton, createInitialButtonState } from '../state/ButtonState'

function preventDefault(e) {
  e.preventDefault()
}

export const addClientInputListeners = () => {
  const xrState = getState(XRState)

  const canvas = EngineRenderer.instance.renderer.domElement

  window.addEventListener('DOMMouseScroll', preventDefault, false)

  const preventDefaultKeyDown = (evt) => {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
    if (evt.code === 'Tab') evt.preventDefault()
    // prevent DOM tab selection and spacebar/enter button toggling (since it interferes with avatar controls)
    if (evt.code === 'Space' || evt.code === 'Enter') evt.preventDefault()
  }

  window.addEventListener('keydown', preventDefaultKeyDown, false)

  document.addEventListener('gesturestart', preventDefault)
  canvas.addEventListener('contextmenu', preventDefault)

  const addInputSource = (source: XRInputSource) => {
    if (source.targetRayMode === 'screen' || source.targetRayMode === 'gaze') {
      removeComponent(emulatedInputSourceEntity, InputSourceComponent)
    }
    const entity = createEntity()
    setComponent(entity, InputSourceComponent, { source })
    setComponent(entity, NameComponent, 'InputSource-handed:' + source.handedness + '-mode:' + source.targetRayMode)
  }

  const removeInputSource = (source: XRInputSource) =>
    removeEntity(InputSourceComponent.entitiesByInputSource.get(source))

  const session = xrState.session

  if (session?.inputSources) for (const inputSource of session?.inputSources) addInputSource(inputSource)

  const onInputSourcesChanged = (event: XRInputSourceChangeEvent) => {
    event.added.map(addInputSource)
    event.removed.map(removeInputSource)
  }

  session?.addEventListener('inputsourceschange', onInputSourcesChanged)

  const addGamepad = (e: GamepadEvent) => {
    const gamepad = navigator.getGamepads()[e.gamepad.index]
    if (!gamepad) return console.warn('[ClientInputSystem] gamepad not found', e.gamepad)
    console.log('[ClientInputSystem] found gamepad', gamepad, e.gamepad)
    gamepadRef = gamepad
  }

  const removeGamepad = (e: GamepadEvent) => {
    console.log('[ClientInputSystem] lost gamepad', e.gamepad)
    gamepadRef = emulatedGamepad
  }

  /** @todo - currently only one gamepad supported */
  window.addEventListener('gamepadconnected', addGamepad)
  window.addEventListener('gamepaddisconnected', removeGamepad)

  /** Keyboard events */
  const onKeyEvent = (event: KeyboardEvent) => {
    const element = event.target as HTMLElement
    // Сheck which excludes the possibility of controlling the avatar when typing in a text field
    if (element?.tagName === 'INPUT' || element?.tagName === 'SELECT' || element?.tagName === 'TEXTAREA') return

    const code = event.code
    const down = event.type === 'keydown'

    const inputSourceComponent = getComponent(emulatedInputSourceEntity, InputSourceComponent)
    const buttonState = inputSourceComponent.buttons as ButtonStateMap

    if (down) buttonState[code] = createInitialButtonState()
    else if (buttonState[code]) buttonState[code].up = true
  }

  document.addEventListener('keyup', onKeyEvent)
  document.addEventListener('keydown', onKeyEvent)

  /** Clear mouse events */
  const pointerButtons = ['PrimaryClick', 'AuxiliaryClick', 'SecondaryClick']
  const clearKeyState = () => {
    const inputSourceComponent = getComponent(emulatedInputSourceEntity, InputSourceComponent)
    const state = inputSourceComponent.buttons as ButtonStateMap
    for (const button of pointerButtons) {
      const val = state[button]
      if (!val?.up && val?.pressed) state[button].up = true
    }
  }
  window.addEventListener('focus', clearKeyState)
  window.addEventListener('blur', clearKeyState)
  canvas.addEventListener('mouseleave', clearKeyState)

  const handleVisibilityChange = (event: Event) => {
    if (document.visibilityState === 'hidden') clearKeyState()
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  /** Mouse events */
  const onWheelEvent = (event: WheelEvent) => {
    const normalizedValues = normalizeWheel(event)
    const x = Math.sign(normalizedValues.spinX + Math.random() * 0.000001)
    const y = Math.sign(normalizedValues.spinY + Math.random() * 0.000001)
    Engine.instance.pointerState.scroll.x += x
    Engine.instance.pointerState.scroll.y += y
  }
  canvas.addEventListener('wheel', onWheelEvent, { passive: true, capture: true })

  const handleMouseClick = (event: MouseEvent) => {
    const down = event.type === 'mousedown' || event.type === 'touchstart'

    let button = MouseButton.PrimaryClick
    if (event.button === 1) button = MouseButton.AuxiliaryClick
    else if (event.button === 2) button = MouseButton.SecondaryClick

    const inputSourceComponent = getComponent(emulatedInputSourceEntity, InputSourceComponent)
    const state = inputSourceComponent.buttons as ButtonStateMap

    if (down) state[button] = createInitialButtonState()
    else if (state[button]) state[button]!.up = true
  }

  const handleMouseMove = (event: MouseEvent) => {
    Engine.instance.pointerState.position.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      (event.clientY / window.innerHeight) * -2 + 1
    )
  }

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    Engine.instance.pointerState.position.set(
      (touch.clientX / window.innerWidth) * 2 - 1,
      (touch.clientY / window.innerHeight) * -2 + 1
    )
  }

  window.addEventListener('touchmove', handleTouchMove, { passive: true, capture: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true, capture: true })
  canvas.addEventListener('mouseup', handleMouseClick)
  canvas.addEventListener('mousedown', handleMouseClick)
  canvas.addEventListener('touchstart', handleMouseClick)
  canvas.addEventListener('touchend', handleMouseClick)

  const handleTouchDirectionalPad = (event: CustomEvent): void => {
    const { stick, value }: { stick: 'LeftStick' | 'RightStick'; value: { x: number; y: number } } = event.detail
    if (!stick) {
      return
    }

    const inputSourceComponent = getComponent(emulatedInputSourceEntity, InputSourceComponent)

    const index = stick === 'LeftStick' ? 0 : 2

    if (!inputSourceComponent.source.gamepad) return

    const axes = inputSourceComponent.source.gamepad.axes as number[]

    axes[index] = value.x
    axes[index + 1] = value.y
  }
  document.addEventListener('touchstickmove', handleTouchDirectionalPad)

  /** @deprecated */
  const handleTouchGampadButton = () => {
    dispatchAction(
      EngineActions.interactedWithObject({
        targetEntity: getState(InteractState).available[0],
        handedness: 'none'
      })
    )
  }
  document.addEventListener('touchgamepadbuttondown', handleTouchGampadButton)

  /**
   * AR uses the `select` event as taps on the screen for mobile AR sessions
   * This gets piped into the input system as a TouchInput.Touch
   */

  const onXRSelectStart = (event: any) => {
    const inputSourceComponent = getComponent(emulatedInputSourceEntity, InputSourceComponent)
    const state = inputSourceComponent.buttons as ButtonStateMap
    state.PrimaryClick = createInitialButtonState()
  }
  const onXRSelectEnd = (event: any) => {
    const inputSourceComponent = getComponent(emulatedInputSourceEntity, InputSourceComponent)
    const state = inputSourceComponent.buttons as ButtonStateMap
    if (!state.PrimaryClick) return
    state.PrimaryClick.up = true
  }
  session?.addEventListener('selectstart', onXRSelectStart)
  session?.addEventListener('selectend', onXRSelectEnd)

  const emulatedTargetRaySpace = {
    emulated: true
  } as any as XRSpace

  const emulatedGamepad = {
    axes: [0, 0, 0, 0],
    buttons: [],
    connected: true,
    hapticActuators: [],
    id: 'ee.emulated-gamepad',
    index: 0,
    mapping: 'standard',
    timestamp: performance.now(),
    vibrationActuator: null
  } as Gamepad

  let gamepadRef = emulatedGamepad

  // create an emulated input source for mouse/keyboard/touch input
  const emulatedInputSource = {
    handedness: 'none',
    targetRayMode: session ? (session.interactionMode === 'screen-space' ? 'screen' : 'gaze') : 'screen',
    targetRaySpace: emulatedTargetRaySpace,
    gripSpace: undefined,
    get gamepad() {
      // workaround since the gamepad doesn't always store a reference internally, so return a new reference
      return gamepadRef === emulatedGamepad ? gamepadRef : navigator.getGamepads()[gamepadRef!.index]
    },
    profiles: [],
    hand: undefined
  } as XRInputSource

  const emulatedInputSourceEntity = createEntity()
  setComponent(emulatedInputSourceEntity, InputSourceComponent, { source: emulatedInputSource })
  setComponent(
    emulatedInputSourceEntity,
    NameComponent,
    'InputSource-emulated ' + '-mode:' + emulatedInputSource.targetRayMode
  )

  return () => {
    inputSources().map((eid) => removeEntity(eid))

    window.removeEventListener('DOMMouseScroll', preventDefault, false)
    window.removeEventListener('keydown', preventDefaultKeyDown, false)
    document.removeEventListener('gesturestart', preventDefault)
    canvas.removeEventListener('contextmenu', preventDefault)

    session?.removeEventListener('inputsourceschange', onInputSourcesChanged)

    window.removeEventListener('gamepadconnected', addGamepad)
    window.removeEventListener('gamepaddisconnected', removeGamepad)

    document.removeEventListener('keyup', onKeyEvent)
    document.removeEventListener('keydown', onKeyEvent)

    window.removeEventListener('focus', clearKeyState)
    window.removeEventListener('blur', clearKeyState)
    canvas.removeEventListener('mouseleave', clearKeyState)

    document.removeEventListener('visibilitychange', handleVisibilityChange)

    canvas.removeEventListener('wheel', onWheelEvent)

    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mouseup', handleMouseClick)
    canvas.removeEventListener('mousedown', handleMouseClick)
    canvas.removeEventListener('touchstart', handleMouseClick)
    canvas.removeEventListener('touchend', handleMouseClick)

    document.removeEventListener('touchstickmove', handleTouchDirectionalPad)
    document.removeEventListener('touchgamepadbuttondown', handleTouchGampadButton)

    session?.removeEventListener('selectstart', onXRSelectStart)
    session?.removeEventListener('selectend', onXRSelectEnd)
  }
}

export function updateGamepadInput(eid: Entity) {
  const inputSource = getComponent(eid, InputSourceComponent)
  const source = inputSource.source
  const buttons = inputSource.buttons as ButtonStateMap
  if (!source.gamepad) return
  const gamepadButtons = source.gamepad.buttons
  if (gamepadButtons) {
    for (let i = 0; i < gamepadButtons.length; i++) {
      const button = gamepadButtons[i]
      if (!buttons[i] && (button.pressed || button.touched)) {
        buttons[i] = createInitialButtonState(button)
      }
      if (buttons[i] && (button.pressed || button.touched)) {
        if (!buttons[i].pressed && button.pressed) buttons[i].down = true
        buttons[i].pressed = button.pressed
        buttons[i].touched = button.touched
        buttons[i].value = button.value
      } else if (buttons[i]) {
        buttons[i].up = true
      }
    }
  }
}

const xrSpaces = defineQuery([XRSpaceComponent, TransformComponent])
const inputSources = defineQuery([InputSourceComponent])

const inputXRUIs = defineQuery([InputComponent, VisibleComponent, XRUIComponent])
const inputObjects = defineQuery([InputComponent, VisibleComponent, GroupComponent])

const rayRotation = new Quaternion()

const inputRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 1000,
  groups: getInteractionGroups(AllCollisionMask, AllCollisionMask),
  excludeRigidBody: undefined //
} as RaycastArgs

const inputRay = new Ray()
const raycaster = new Raycaster()

const execute = () => {
  Engine.instance.pointerScreenRaycaster.setFromCamera(
    Engine.instance.pointerState.position,
    getComponent(Engine.instance.cameraEntity, CameraComponent)
  )

  Engine.instance.pointerState.movement.subVectors(
    Engine.instance.pointerState.position,
    Engine.instance.pointerState.lastPosition
  )
  Engine.instance.pointerState.lastPosition.copy(Engine.instance.pointerState.position)

  Engine.instance.pointerState.lastScroll.copy(Engine.instance.pointerState.scroll)

  const xrFrame = Engine.instance.xrFrame
  const origin = ReferenceSpace.origin

  for (const eid of xrSpaces()) {
    const space = getComponent(eid, XRSpaceComponent)
    // our custom input source is not a valid pose, so ignore it - might want a better way than this
    if ('emulated' in space) continue
    const pose = origin && xrFrame?.getPose(space, origin)
    if (pose) {
      TransformComponent.position.x[eid] = pose.transform.position.x
      TransformComponent.position.y[eid] = pose.transform.position.y
      TransformComponent.position.z[eid] = pose.transform.position.z
      TransformComponent.rotation.x[eid] = pose.transform.orientation.x
      TransformComponent.rotation.y[eid] = pose.transform.orientation.y
      TransformComponent.rotation.z[eid] = pose.transform.orientation.z
      TransformComponent.rotation.w[eid] = pose.transform.orientation.w
      TransformComponent.dirtyTransforms[eid] = true
    }
  }

  for (const sourceEid of inputSources()) {
    const sourceTransform = getComponent(sourceEid, TransformComponent)
    const source = getMutableComponent(sourceEid, InputSourceComponent)

    if (!xrFrame && source.source.targetRayMode.value === 'screen') {
      const ray = Engine.instance.pointerScreenRaycaster.ray

      TransformComponent.position.x[sourceEid] = ray.origin.x
      TransformComponent.position.y[sourceEid] = ray.origin.y
      TransformComponent.position.z[sourceEid] = ray.origin.z

      // set rayDirection to be the direction of the ray
      rayRotation.setFromUnitVectors(ObjectDirection.Forward, ray.direction)

      TransformComponent.rotation.x[sourceEid] = rayRotation.x
      TransformComponent.rotation.y[sourceEid] = rayRotation.y
      TransformComponent.rotation.z[sourceEid] = rayRotation.z
      TransformComponent.rotation.w[sourceEid] = rayRotation.w
      TransformComponent.dirtyTransforms[sourceEid] = true
    }

    const capturedButtons = hasComponent(sourceEid, InputSourceButtonsCapturedComponent)
    const capturedAxes = hasComponent(sourceEid, InputSourceAxesCapturedComponent)

    if (!capturedButtons || !capturedAxes) {
      let assignedInputEntity = UndefinedEntity as Entity

      inputRaycast.direction.copy(ObjectDirection.Forward).applyQuaternion(sourceTransform.rotation)
      inputRaycast.origin.copy(sourceTransform.position).addScaledVector(inputRaycast.direction, -0.01)
      inputRaycast.excludeRigidBody = getOptionalComponent(Engine.instance.localClientEntity, RigidBodyComponent)?.body
      inputRay.set(inputRaycast.origin, inputRaycast.direction)

      // 1st heuristic is XRUI
      for (const eid of inputXRUIs()) {
        const xrui = getComponent(eid, XRUIComponent)
        const layerHit = xrui.hitTest(inputRay)
        if (
          !layerHit ||
          !layerHit.intersection.object.visible ||
          (layerHit.intersection.object as Mesh<any, MeshBasicMaterial>).material?.opacity < 0.01
        )
          continue
        assignedInputEntity = eid
        break
      }

      // 2nd heuristic is scene objects when in the editor
      if (getState(EngineState).isEditor) {
        raycaster.set(inputRaycast.origin, inputRaycast.direction)
        const objects = inputObjects()
          .map((eid) => getComponent(eid, GroupComponent))
          .flat()
        const hits = raycaster
          .intersectObjects<Object3DWithEntity>(objects, true)
          .sort((a, b) => a.distance - b.distance)

        if (hits.length) {
          const object = hits[0].object
          const parentObject = Object3DUtils.findAncestor(object, (obj) => obj.parent === Engine.instance.scene)
          assignedInputEntity = parentObject.entity
        }
      }

      const physicsWorld = getState(PhysicsState).physicsWorld

      // 3nd heuristic is physics colliders
      if (physicsWorld && !assignedInputEntity) {
        const hit = Physics.castRay(physicsWorld, inputRaycast)[0]
        if (hit) assignedInputEntity = hit.entity
      }

      if (!capturedButtons) source.assignedButtonEntity.set(assignedInputEntity)
      if (!capturedAxes) source.assignedAxesEntity.set(assignedInputEntity)
    }

    updateGamepadInput(sourceEid)
  }
}

const reactor = () => {
  const xrState = useHookstate(getMutableState(XRState))

  useEffect(addClientInputListeners, [xrState.session])

  return null
}

export const ClientInputSystem = defineSystem({
  uuid: 'ee.engine.input.ClientInputSystem',
  execute,
  reactor
})
