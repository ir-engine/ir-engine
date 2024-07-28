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

import { Not } from 'bitecs'
import React, { useEffect } from 'react'
import { Mesh, MeshBasicMaterial, Object3D, Quaternion, Ray, Raycaster, Vector3 } from 'three'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { Object3DUtils } from '@etherealengine/common/src/utils/Object3DUtils'
import {
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity, EntityUUID, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { defineQuery, QueryReactor } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { InputSystemGroup, PresentationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { getMutableState, getState, useImmediateEffect, useMutableState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import {
  EntityTreeComponent,
  getAncestorWithComponent,
  useAncestorWithComponent
} from '@etherealengine/spatial/src/transform/components/EntityTree'

import { UUIDComponent } from '@etherealengine/ecs'
import { InteractableComponent } from '@etherealengine/engine/src/interaction/components/InteractableComponent'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { ObjectDirection, PI, Q_IDENTITY, Vector3_Zero } from '../../common/constants/MathConstants'
import { NameComponent } from '../../common/NameComponent'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { GroupComponent } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { SceneComponent } from '../../renderer/components/SceneComponents'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponents'
import { TransformComponent, TransformGizmoTagComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { XRScenePlacementComponent } from '../../xr/XRScenePlacementComponent'
import { XRState } from '../../xr/XRState'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { DefaultButtonAlias, InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import normalizeWheel from '../functions/normalizeWheel'
import { AnyButton, ButtonState, ButtonStateMap, createInitialButtonState, MouseButton } from '../state/ButtonState'
import { InputState } from '../state/InputState'

/** squared distance threshold for dragging state */
const DRAGGING_THRESHOLD = 0.001

/** radian threshold for rotating state*/
const ROTATING_THRESHOLD = 1.5 * (PI / 180)

/** anti-garbage variable!! value not to be used unless you set values just before use*/
const pointerPositionVector3 = new Vector3()

function preventDefault(e) {
  e.preventDefault()
}

const preventDefaultKeyDown = (evt) => {
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
  if (gamepadButtons.length) {
    const pointer = getOptionalComponent(eid, InputPointerComponent)
    const xrTransform = getOptionalComponent(eid, TransformComponent)

    for (let i = 0; i < gamepadButtons.length; i++) {
      const gamepadButton = gamepadButtons[i]
      if (!buttons[i] && (gamepadButton.pressed || gamepadButton.touched)) {
        buttons[i] = createInitialButtonState(eid, gamepadButton)
      }
      const buttonState = buttons[i] as ButtonState
      if (buttonState && (gamepadButton.pressed || gamepadButton.touched)) {
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
        buttonState.pressed = gamepadButton.pressed
        buttonState.touched = gamepadButton.touched
        buttonState.value = gamepadButton.value

        if (buttonState.downPosition) {
          //if not yet dragging, compare distance to drag threshold and begin if appropriate
          if (!buttonState.dragging) {
            if (pointer) pointerPositionVector3.set(pointer.position.x, pointer.position.y, 0)
            const squaredDistance = buttonState.downPosition.distanceToSquared(
              pointer ? pointerPositionVector3 : xrTransform?.position ?? Vector3_Zero
            )

            if (squaredDistance > DRAGGING_THRESHOLD) {
              buttonState.dragging = true
            }
          }

          //if not yet rotating, compare distance to drag threshold and begin if appropriate
          if (!buttonState.rotating) {
            const angleRadians = buttonState.downRotation!.angleTo(
              pointer ? Q_IDENTITY : xrTransform?.rotation ?? Q_IDENTITY
            )
            if (angleRadians > ROTATING_THRESHOLD) {
              buttonState.rotating = true
            }
          }
        }
      } else if (buttonState) {
        buttonState.up = true
      }
    }
  }
}

const pointers = defineQuery([InputPointerComponent, InputSourceComponent, Not(XRSpaceComponent)])
const xrSpaces = defineQuery([XRSpaceComponent, TransformComponent])
const spatialInputSourceQuery = defineQuery([InputSourceComponent, TransformComponent])
const inputSourceQuery = defineQuery([InputSourceComponent])
const nonSpatialInputSourceQuery = defineQuery([InputSourceComponent, Not(TransformComponent)])
const inputs = defineQuery([InputComponent])

const worldPosInputSourceComponent = new Vector3()
const worldPosInputComponent = new Vector3()

const xruiQuery = defineQuery([VisibleComponent, XRUIComponent])
const boundingBoxesQuery = defineQuery([VisibleComponent, BoundingBoxComponent])

const meshesQuery = defineQuery([VisibleComponent, MeshComponent])
const sceneQuery = defineQuery([SceneComponent])

/**Editor InputComponent raycast query */
const inputObjects = defineQuery([InputComponent, VisibleComponent, GroupComponent])
/**Proximity query */
const spatialInputObjects = defineQuery([
  InputComponent,
  VisibleComponent,
  TransformComponent,
  Not(CameraComponent),
  Not(XRScenePlacementComponent)
])
/** @todo abstract into heuristic api */
const gizmoPickerObjects = defineQuery([InputComponent, GroupComponent, VisibleComponent, TransformGizmoTagComponent])

const rayRotation = new Quaternion()

const inputRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 1000,
  groups: getInteractionGroups(CollisionGroups.Default, CollisionGroups.Default),
  excludeRigidBody: undefined //
} as RaycastArgs

const inputRay = new Ray()
const raycaster = new Raycaster()
const bboxHitTarget = new Vector3()

const quat = new Quaternion()

const execute = () => {
  const capturedEntity = getMutableState(InputState).capturingEntity.value
  InputState.setCapturingEntity(UndefinedEntity, true)

  for (const eid of inputs())
    if (getComponent(eid, InputComponent).inputSources.length)
      getMutableComponent(eid, InputComponent).inputSources.set([])

  // update 2D screen-based (driven by pointer api) input sources
  for (const eid of pointers()) {
    const pointer = getComponent(eid, InputPointerComponent)
    const inputSource = getComponent(eid, InputSourceComponent)
    const camera = getComponent(pointer.cameraEntity, CameraComponent)
    pointer.movement.copy(pointer.position).sub(pointer.lastPosition)
    pointer.lastPosition.copy(pointer.position)
    inputSource.raycaster.setFromCamera(pointer.position, camera)
    TransformComponent.position.x[eid] = inputSource.raycaster.ray.origin.x
    TransformComponent.position.y[eid] = inputSource.raycaster.ray.origin.y
    TransformComponent.position.z[eid] = inputSource.raycaster.ray.origin.z
    rayRotation.setFromUnitVectors(ObjectDirection.Forward, inputSource.raycaster.ray.direction)
    TransformComponent.rotation.x[eid] = rayRotation.x
    TransformComponent.rotation.y[eid] = rayRotation.y
    TransformComponent.rotation.z[eid] = rayRotation.z
    TransformComponent.rotation.w[eid] = rayRotation.w
    TransformComponent.dirtyTransforms[eid] = true
  }

  // update xr input sources
  const xrFrame = getState(XRState).xrFrame

  for (const eid of xrSpaces()) {
    const space = getComponent(eid, XRSpaceComponent)
    const pose = xrFrame?.getPose(space.space, space.baseSpace)
    if (!pose) continue // @note Clause Guard. This was nested as   if (pose) { ... }
    TransformComponent.position.x[eid] = pose.transform.position.x
    TransformComponent.position.y[eid] = pose.transform.position.y
    TransformComponent.position.z[eid] = pose.transform.position.z
    TransformComponent.rotation.x[eid] = pose.transform.orientation.x
    TransformComponent.rotation.y[eid] = pose.transform.orientation.y
    TransformComponent.rotation.z[eid] = pose.transform.orientation.z
    TransformComponent.rotation.w[eid] = pose.transform.orientation.w
    TransformComponent.dirtyTransforms[eid] = true
  }

  const interactionRays = inputSourceQuery().map((eid) => getComponent(eid, InputSourceComponent).raycaster.ray)
  for (const xrui of xruiQuery()) {
    getComponent(xrui, XRUIComponent).interactionRays = interactionRays
  }

  // assign input sources (InputSourceComponent) to input sinks (InputComponent), foreach on InputSourceComponents
  for (const sourceEid of inputSourceQuery()) {
    // @note This function was a ~200 sloc block nested inside this `for` block,
    // which also contained two other sub-nested blocks of 100 and 50 sloc each
    assignInputSources(sourceEid, capturedEntity)
  }

  for (const sourceEid of inputSourceQuery()) {
    updateGamepadInput(sourceEid)
  }
}

const setInputSources = (startEntity: Entity, inputSources: Entity[]) => {
  const inputEntity = getAncestorWithComponent(startEntity, InputComponent)
  if (inputEntity) {
    const inputComponent = getComponent(inputEntity, InputComponent)

    for (const sinkEntityUUID of inputComponent.inputSinks) {
      const sinkEntity = sinkEntityUUID === 'Self' ? inputEntity : UUIDComponent.getEntityByUUID(sinkEntityUUID) //TODO why is this not sending input to my sinks
      const sinkInputComponent = getMutableComponent(sinkEntity, InputComponent)
      sinkInputComponent.inputSources.merge(inputSources)
    }
  }
}

const useNonSpatialInputSources = () => {
  useEffect(() => {
    const eid = createEntity()
    setComponent(eid, InputSourceComponent, {})
    setComponent(eid, NameComponent, 'InputSource-nonspatial')
    const inputSourceComponent = getComponent(eid, InputSourceComponent)

    document.addEventListener('DOMMouseScroll', preventDefault, false)
    document.addEventListener('gesturestart', preventDefault)
    document.addEventListener('keydown', preventDefaultKeyDown, false)

    const onKeyEvent = (event: KeyboardEvent) => {
      preventDefaultKeyDown(event)
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

    document.addEventListener('touchgamepadbuttondown', (event: CustomEvent) => {
      const buttonState = inputSourceComponent.buttons
      buttonState[event.detail.button] = createInitialButtonState(eid)
    })

    document.addEventListener('touchgamepadbuttonup', (event: CustomEvent) => {
      const buttonState = inputSourceComponent.buttons
      if (buttonState[event.detail.button]) buttonState[event.detail.button].up = true
    })

    return () => {
      document.removeEventListener('DOMMouseScroll', preventDefault, false)
      document.removeEventListener('gesturestart', preventDefault)
      document.removeEventListener('keyup', onKeyEvent)
      document.removeEventListener('keydown', onKeyEvent)
      document.removeEventListener('touchstickmove', handleTouchDirectionalPad)
      removeEntity(eid)
    }
  }, [])
}

const useGamepadInputSources = () => {
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

const CanvasInputReactor = () => {
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
      redirectPointerEventsToXRUI(cameraEntity, event)
    }

    const onPointerOver = (event: PointerEvent) => {
      redirectPointerEventsToXRUI(cameraEntity, event)
    }

    const onPointerOut = (event: PointerEvent) => {
      redirectPointerEventsToXRUI(cameraEntity, event)
    }

    const onPointerLeave = (event: PointerEvent) => {
      const pointerEntity = InputPointerComponent.getPointerByID(cameraEntity, event.pointerId)
      redirectPointerEventsToXRUI(cameraEntity, event)
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

      redirectPointerEventsToXRUI(cameraEntity, event)
    }

    const onPointerMove = (event: PointerEvent) => {
      const pointerEntity = InputPointerComponent.getPointerByID(cameraEntity, event.pointerId)
      const pointerComponent = getOptionalComponent(pointerEntity, InputPointerComponent)
      if (!pointerComponent) return

      pointerComponent.position.set(
        ((event.clientX - canvas.getBoundingClientRect().x) / canvas.clientWidth) * 2 - 1,
        ((event.clientY - canvas.getBoundingClientRect().y) / canvas.clientHeight) * -2 + 1
      )

      updatePointerDragging(pointerEntity, event)
      redirectPointerEventsToXRUI(cameraEntity, event)
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
      redirectPointerEventsToXRUI(cameraEntity, evt)
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

    canvas.addEventListener('dragstart', preventDefault, false)
    canvas.addEventListener('contextmenu', preventDefault)
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
      canvas.removeEventListener('dragstart', preventDefault, false)
      canvas.removeEventListener('contextmenu', preventDefault)
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

const useXRInputSources = () => {
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

const reactor = () => {
  if (!isClient) return null

  useNonSpatialInputSources()
  useGamepadInputSources()
  useXRInputSources()

  return (
    <>
      <QueryReactor Components={[RendererComponent]} ChildEntityReactor={CanvasInputReactor} />
      <QueryReactor Components={[MeshComponent]} ChildEntityReactor={MeshInputReactor} />
      <QueryReactor Components={[BoundingBoxComponent]} ChildEntityReactor={BoundingBoxInputReactor} />
    </>
  )
}

const MeshInputReactor = () => {
  const entity = useEntityContext()
  const shouldReceiveInput = !!useAncestorWithComponent(entity, InputComponent)

  useImmediateEffect(() => {
    const inputState = getState(InputState)
    if (shouldReceiveInput) inputState.inputMeshes.add(entity)
    else inputState.inputMeshes.delete(entity)
  }, [shouldReceiveInput])
  return null
}

const BoundingBoxInputReactor = () => {
  const entity = useEntityContext()
  const shouldReceiveInput = !!useAncestorWithComponent(entity, InputComponent)
  useImmediateEffect(() => {
    const inputState = getState(InputState)
    if (shouldReceiveInput) inputState.inputBoundingBoxes.add(entity)
    else inputState.inputBoundingBoxes.delete(entity)
  }, [shouldReceiveInput])
  return null
}

export const ClientInputSystem = defineSystem({
  uuid: 'ee.engine.input.ClientInputSystem',
  insert: { before: InputSystemGroup },
  execute,
  reactor
})

function updatePointerDragging(pointerEntity: Entity, event: PointerEvent) {
  const inputSourceComponent = getOptionalComponent(pointerEntity, InputSourceComponent)
  if (!inputSourceComponent) return

  const state = inputSourceComponent.buttons as ButtonStateMap<typeof DefaultButtonAlias>

  let button = MouseButton.PrimaryClick
  if (event.type === 'pointermove') {
    if ((event as MouseEvent).button === 1) button = MouseButton.AuxiliaryClick
    else if ((event as MouseEvent).button === 2) button = MouseButton.SecondaryClick
  }
  const btn = state[button]
  if (btn && !btn.dragging) {
    const pointer = getOptionalComponent(pointerEntity, InputPointerComponent)

    if (btn.pressed && btn.downPosition) {
      //if not yet dragging, compare distance to drag threshold and begin if appropriate
      if (!btn.dragging) {
        pointer
          ? pointerPositionVector3.set(pointer.position.x, pointer.position.y, 0)
          : pointerPositionVector3.copy(Vector3_Zero)
        const squaredDistance = btn.downPosition.distanceToSquared(pointerPositionVector3)

        if (squaredDistance > DRAGGING_THRESHOLD) {
          btn.dragging = true
        }
      }
    }
  }
}

function cleanupButton(
  key: string,
  buttons: ButtonStateMap<Partial<Record<string | number | symbol, ButtonState | undefined>>>,
  hasFocus: boolean
) {
  const button = buttons[key]
  if (button?.down) button.down = false
  if (button?.up || !hasFocus) delete buttons[key]
}

const cleanupInputs = () => {
  if (typeof globalThis.document === 'undefined') return

  const hasFocus = document.hasFocus()

  for (const eid of inputSourceQuery()) {
    const source = getComponent(eid, InputSourceComponent)
    for (const key in source.buttons) {
      cleanupButton(key, source.buttons, hasFocus)
    }

    // clear non-spatial emulated axes data end of each frame
    // this is used to clear wheel speed each frame
    if (!hasComponent(eid, XRSpaceComponent) && hasComponent(eid, InputPointerComponent)) {
      ;(source.source.gamepad!.axes as number[]).fill(0)
    }
  }
}

export const ClientInputCleanupSystem = defineSystem({
  uuid: 'ee.engine.input.ClientInputCleanupSystem',
  insert: { after: PresentationSystemGroup },
  execute: cleanupInputs
})

const redirectPointerEventsToXRUI = (cameraEntity: Entity, evt: PointerEvent) => {
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

type IntersectionData = {
  entity: Entity
  distance: number
}

function applyRaycastedInputHeuristics(sourceEid: Entity, intersectionData: Set<IntersectionData>) {
  const sourceRotation = TransformComponent.getWorldRotation(sourceEid, quat)
  inputRaycast.direction.copy(ObjectDirection.Forward).applyQuaternion(sourceRotation)

  TransformComponent.getWorldPosition(sourceEid, inputRaycast.origin).addScaledVector(inputRaycast.direction, -0.01)
  inputRay.set(inputRaycast.origin, inputRaycast.direction)
  raycaster.set(inputRaycast.origin, inputRaycast.direction)
  raycaster.layers.enable(ObjectLayers.Scene)

  const isEditing = getState(EngineState).isEditing
  // only heuristic is scene objects when in the editor
  if (isEditing) {
    applyHeuristicEditor(intersectionData)
  } else {
    // 1st heuristic is XRUI
    applyHeuristicXRUI(intersectionData)
    // 2nd heuristic is physics colliders
    applyHeuristicPhysicsColliders(intersectionData)

    // 3rd heuristic is bboxes
    applyHeuristicBBoxes(intersectionData)
  }
  // 4th heuristic is meshes
  applyHeuristicMeshes(intersectionData, isEditing)
}

function assignInputSources(sourceEid: Entity, capturedEntity: Entity) {
  const isSpatialInput = hasComponent(sourceEid, TransformComponent)

  const intersectionData = new Set([] as IntersectionData[])

  // @note This function was a ~100 sloc block nested inside this if block
  if (isSpatialInput) applyRaycastedInputHeuristics(sourceEid, intersectionData)

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
    // @note This function was a ~50sloc block nested inside this if block
    applyHeuristicProximity(isSpatialInput, sourceEid, sortedIntersections, intersectionData)
  }

  const inputPointerComponent = getOptionalComponent(sourceEid, InputPointerComponent)
  if (inputPointerComponent) {
    sortedIntersections.push({ entity: inputPointerComponent.cameraEntity, distance: 0 })
  }

  sourceState.intersections.set(sortedIntersections)

  const finalInputSources = Array.from(new Set([sourceEid, ...nonSpatialInputSourceQuery()]))

  //if we have a capturedEntity, only run on the capturedEntity, not the sortedIntersections
  if (capturedEntity !== UndefinedEntity) {
    setInputSources(capturedEntity, finalInputSources)
  } else {
    for (const intersection of sortedIntersections) {
      setInputSources(intersection.entity, finalInputSources)
    }
  }
}

function applyHeuristicProximity(
  isSpatialInput: boolean,
  sourceEid: Entity,
  sortedIntersections: IntersectionData[],
  intersectionData: Set<IntersectionData>
) {
  const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar

  //use sourceEid if controller (one InputSource per controller), otherwise use avatar rather than InputSource-emulated-pointer
  const selfAvatarEntity = UUIDComponent.getEntityByUUID((Engine.instance.userID + '-avatar') as EntityUUID) //would prefer a better way to do this
  const inputSourceEntity = isCameraAttachedToAvatar && isSpatialInput ? sourceEid : selfAvatarEntity

  // Skip Proximity Heuristic when the entity is undefined
  // @note Clause Guard. This entire function was a block nested inside   if (inputSourceEntity !== UndefinedEntity) { ... }
  if (inputSourceEntity === UndefinedEntity) return

  TransformComponent.getWorldPosition(inputSourceEntity, worldPosInputSourceComponent)

  //TODO spatialInputObjects or inputObjects?  - inputObjects requires visible and group components
  for (const inputEntity of spatialInputObjects()) {
    if (inputEntity === selfAvatarEntity) continue
    const inputComponent = getComponent(inputEntity, InputComponent)

    TransformComponent.getWorldPosition(inputEntity, worldPosInputComponent)
    const distSquared = worldPosInputSourceComponent.distanceToSquared(worldPosInputComponent)

    //closer than our current closest AND within inputSource's activation distance
    if (inputComponent.activationDistance * inputComponent.activationDistance > distSquared) {
      //using this object type out of convenience (intersectionsData is also guaranteed empty in this flow)
      intersectionData.add({ entity: inputEntity, distance: distSquared }) //keeping it as distSquared for now to avoid extra square root calls
    }
  }
  const closestEntities = Array.from(intersectionData)
  if (closestEntities.length > 0) {
    if (closestEntities.length === 1) {
      sortedIntersections.push({
        entity: closestEntities[0].entity,
        distance: Math.sqrt(closestEntities[0].distance)
      })
    } else {
      //sort if more than 1 entry
      closestEntities.sort((a, b) => {
        //prioritize anything with an InteractableComponent if otherwise equal
        const aNum = hasComponent(a.entity, InteractableComponent) ? -1 : 0
        const bNum = hasComponent(b.entity, InteractableComponent) ? -1 : 0
        //aNum - bNum : 0 if equal, -1 if a has tag and b doesn't, 1 if a doesnt have tag and b does
        return Math.sign(a.distance - b.distance) + (aNum - bNum)
      })
      sortedIntersections.push({
        entity: closestEntities[0].entity,
        distance: Math.sqrt(closestEntities[0].distance)
      })
    }
  }
}

function applyHeuristicEditor(intersectionData: Set<IntersectionData>) {
  const pickerObj = gizmoPickerObjects() // gizmo heuristic
  const inputObj = inputObjects()

  const objects = (pickerObj.length > 0 ? pickerObj : inputObj) // gizmo heuristic
    .map((eid) => getComponent(eid, GroupComponent))
    .flat()
  pickerObj.length > 0
    ? raycaster.layers.enable(ObjectLayers.TransformGizmo)
    : raycaster.layers.disable(ObjectLayers.TransformGizmo)
  const hits = raycaster.intersectObjects<Object3D>(objects, true)
  for (const hit of hits) {
    const parentObject = Object3DUtils.findAncestor(hit.object, (obj) => !obj.parent)
    if (parentObject?.entity) {
      intersectionData.add({ entity: parentObject.entity, distance: hit.distance })
    }
  }
}

function applyHeuristicXRUI(intersectionData: Set<IntersectionData>) {
  for (const entity of xruiQuery()) {
    const xrui = getComponent(entity, XRUIComponent)
    const layerHit = xrui.hitTest(inputRay)
    if (
      !layerHit ||
      !layerHit.intersection.object.visible ||
      (layerHit.intersection.object as Mesh<any, MeshBasicMaterial>).material?.opacity < 0.01
    )
      continue
    intersectionData.add({ entity, distance: layerHit.intersection.distance })
  }
}

function applyHeuristicPhysicsColliders(intersectionData: Set<IntersectionData>) {
  for (const entity of sceneQuery()) {
    const world = Physics.getWorld(entity)
    if (!world) continue

    const hits = Physics.castRay(world, inputRaycast)
    for (const hit of hits) {
      if (!hit.entity) continue
      intersectionData.add({ entity: hit.entity, distance: hit.distance })
    }
  }
}

function applyHeuristicBBoxes(intersectionData: Set<IntersectionData>) {
  const inputState = getState(InputState)
  for (const entity of inputState.inputBoundingBoxes) {
    const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)
    if (!boundingBox) continue
    const hit = inputRay.intersectBox(boundingBox.box, bboxHitTarget)
    if (hit) {
      intersectionData.add({ entity, distance: inputRay.origin.distanceTo(bboxHitTarget) })
    }
  }
}

function applyHeuristicMeshes(intersectionData: Set<IntersectionData>, isEditing: boolean) {
  const inputState = getState(InputState)
  const objects = (isEditing ? meshesQuery() : Array.from(inputState.inputMeshes)) // gizmo heuristic
    .filter((eid) => hasComponent(eid, GroupComponent))
    .map((eid) => getComponent(eid, GroupComponent))
    .flat()

  const hits = raycaster.intersectObjects<Object3D>(objects, true)
  for (const hit of hits) {
    const parentObject = Object3DUtils.findAncestor(hit.object, (obj) => obj.entity != undefined)
    if (parentObject) {
      intersectionData.add({ entity: parentObject.entity, distance: hit.distance })
    }
  }
}

/**
 * @private
 * @description Private Access Only. Exports for use within unit tests. */
export const PRIVATE = {
  assignInputSources,

  applyHeuristicProximity,

  applyRaycastedInputHeuristics,
  applyHeuristicEditor,
  applyHeuristicXRUI,
  applyHeuristicPhysicsColliders,
  applyHeuristicBBoxes,
  applyHeuristicMeshes
}
