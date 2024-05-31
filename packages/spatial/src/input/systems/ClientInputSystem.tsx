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
  removeComponent,
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
import { CameraComponent } from '../../camera/components/CameraComponent'
import { ObjectDirection } from '../../common/constants/MathConstants'
import { NameComponent } from '../../common/NameComponent'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { GroupComponent } from '../../renderer/components/GroupComponent'
import { MeshComponent } from '../../renderer/components/MeshComponent'
import { VisibleComponent } from '../../renderer/components/VisibleComponent'
import { ObjectLayers } from '../../renderer/constants/ObjectLayers'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { BoundingBoxComponent } from '../../transform/components/BoundingBoxComponents'
import { TransformComponent, TransformGizmoTagComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { XRScenePlacementComponent } from '../../xr/XRScenePlacementComponent'
import { XRControlsState, XRState } from '../../xr/XRState'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import normalizeWheel from '../functions/normalizeWheel'
import { ButtonStateMap, createInitialButtonState, MouseButton } from '../state/ButtonState'
import { InputState } from '../state/InputState'

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
  const buttons = inputSource.buttons as ButtonStateMap

  // log buttons
  // if (source.gamepad) {
  //   for (let i = 0; i < source.gamepad.buttons.length; i++) {
  //     const button = source.gamepad.buttons[i]
  //     if (button.pressed) console.log('button ' + i + ' pressed: ' + button.pressed)
  //   }
  // }

  if (!gamepad) return
  const gamepadButtons = gamepad.buttons
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

const pointers = defineQuery([InputPointerComponent, InputSourceComponent, Not(XRSpaceComponent)])
const xrSpaces = defineQuery([XRSpaceComponent, TransformComponent])
const spatialInputSourceQuery = defineQuery([InputSourceComponent, TransformComponent])
const inputSourceQuery = defineQuery([InputSourceComponent])
const nonSpatialInputSourceQuery = defineQuery([InputSourceComponent, Not(TransformComponent)])
const inputs = defineQuery([InputComponent])

const worldPosInputSourceComponent = new Vector3()
const worldPosInputComponent = new Vector3()

const inputXRUIs = defineQuery([InputComponent, VisibleComponent, XRUIComponent])
const boundingBoxesQuery = defineQuery([VisibleComponent, BoundingBoxComponent])

const meshesQuery = defineQuery([VisibleComponent, MeshComponent])

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
  InputState.setCapturingEntity(UndefinedEntity, true)

  for (const eid of inputs())
    if (getComponent(eid, InputComponent).inputSources.length)
      getMutableComponent(eid, InputComponent).inputSources.set([])

  // update 2D screen-based (driven by pointer api) input sources
  const camera = getComponent(Engine.instance.viewerEntity, CameraComponent)
  for (const eid of pointers()) {
    const pointer = getComponent(eid, InputPointerComponent)
    const inputSource = getComponent(eid, InputSourceComponent)
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
  const physicsState = getState(PhysicsState)
  inputRaycast.excludeRigidBody = physicsState.cameraAttachedRigidbodyEntity

  for (const eid of xrSpaces()) {
    const space = getComponent(eid, XRSpaceComponent)
    const pose = xrFrame?.getPose(space.space, space.baseSpace)
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

  const capturedEntity = getMutableState(InputState).capturingEntity

  // assign input sources (InputSourceComponent) to input sinks (InputComponent), foreach on InputSourceComponents
  for (const sourceEid of inputSourceQuery()) {
    const isSpatialInput = hasComponent(sourceEid, TransformComponent)

    const intersectionData = new Set(
      [] as {
        entity: Entity
        distance: number
      }[]
    )

    if (isSpatialInput) {
      const sourceRotation = TransformComponent.getWorldRotation(sourceEid, quat)
      inputRaycast.direction.copy(ObjectDirection.Forward).applyQuaternion(sourceRotation)

      TransformComponent.getWorldPosition(sourceEid, inputRaycast.origin).addScaledVector(inputRaycast.direction, -0.01)
      inputRay.set(inputRaycast.origin, inputRaycast.direction)
      raycaster.set(inputRaycast.origin, inputRaycast.direction)
      raycaster.layers.enable(ObjectLayers.Default)

      const inputState = getState(InputState)
      const isEditing = getState(EngineState).isEditing
      // only heuristic is scene objects when in the editor
      if (isEditing) {
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
      } else {
        // 1st heuristic is XRUI
        for (const entity of inputXRUIs()) {
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

        const physicsWorld = getState(PhysicsState).physicsWorld

        // 2nd heuristic is physics colliders
        if (physicsWorld) {
          const hits = Physics.castRay(physicsWorld, inputRaycast)
          for (const hit of hits) {
            if (!hit.entity) continue
            intersectionData.add({ entity: hit.entity, distance: hit.distance })
          }
        }

        // 3rd heuristic is bboxes
        for (const entity of inputState.inputBoundingBoxes) {
          const boundingBox = getComponent(entity, BoundingBoxComponent)
          const hit = inputRay.intersectBox(boundingBox.box, bboxHitTarget)
          if (hit) {
            intersectionData.add({ entity, distance: inputRay.origin.distanceTo(bboxHitTarget) })
          }
        }
      }

      // 4th heuristic is meshes
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

    const sortedIntersections = Array.from(intersectionData).sort((a, b) => a.distance - b.distance)
    const sourceState = getMutableComponent(sourceEid, InputSourceComponent)

    //TODO check all inputSources sorted by distance list of InputComponents from query, probably similar to the spatialInputQuery
    //Proximity check ONLY if we have no raycast results, as it is always lower priority
    if (
      capturedEntity.value === UndefinedEntity &&
      sortedIntersections.length === 0 &&
      !hasComponent(sourceEid, InputPointerComponent)
    ) {
      let closestEntity = UndefinedEntity
      let closestDistanceSquared = Infinity

      //use sourceEid if controller (one InputSource per controller), otherwise use avatar rather than InputSource-emulated-pointer
      const selfAvatarEntity = UUIDComponent.getEntityByUUID((Engine.instance.userID + '_avatar') as EntityUUID) //would prefer a better way to do this
      const inputSourceEntity =
        getState(XRControlsState).isCameraAttachedToAvatar && isSpatialInput ? sourceEid : selfAvatarEntity

      if (inputSourceEntity !== UndefinedEntity) {
        TransformComponent.getWorldPosition(inputSourceEntity, worldPosInputSourceComponent)

        //TODO spatialInputObjects or inputObjects?  - inputObjects requires visible and group components
        for (const inputEntity of spatialInputObjects()) {
          if (inputEntity === selfAvatarEntity) continue
          const inputComponent = getComponent(inputEntity, InputComponent)

          TransformComponent.getWorldPosition(inputEntity, worldPosInputComponent)

          const distSquared = worldPosInputSourceComponent.distanceToSquared(worldPosInputComponent)

          //closer than our current closest AND within inputSource's activation distance
          if (
            distSquared < closestDistanceSquared &&
            inputComponent.activationDistance * inputComponent.activationDistance > distSquared
          ) {
            closestDistanceSquared = distSquared
            closestEntity = inputEntity
          }
        }
        if (closestEntity !== UndefinedEntity) {
          sortedIntersections.push({ entity: closestEntity, distance: Math.sqrt(closestDistanceSquared) })
        }
      }
    }

    const inputPointerComponent = getOptionalComponent(sourceEid, InputPointerComponent)
    if (inputPointerComponent) {
      sortedIntersections.push({ entity: inputPointerComponent.canvasEntity, distance: 0 })
    }

    sourceState.intersections.set(sortedIntersections)

    const finalInputSources = Array.from(new Set([sourceEid, ...nonSpatialInputSourceQuery()]))

    //if we have a capturedEntity, only run on the capturedEntity, not the sortedIntersections
    if (capturedEntity.value !== UndefinedEntity) {
      setInputSources(capturedEntity.value, finalInputSources)
    } else {
      for (const intersection of sortedIntersections) {
        setInputSources(intersection.entity, finalInputSources)
      }
    }
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

      const buttonState = inputSourceComponent.buttons as ButtonStateMap
      if (down) buttonState[code] = createInitialButtonState()
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
      const buttonState = inputSourceComponent.buttons as ButtonStateMap
      buttonState[event.detail.button] = createInitialButtonState()
    })

    document.addEventListener('touchgamepadbuttonup', (event: CustomEvent) => {
      const buttonState = inputSourceComponent.buttons as ButtonStateMap
      if (buttonState[event.detail.button]) buttonState[event.detail.button].up = true
    })

    const onWheelEvent = (event: WheelEvent) => {
      const normalizedValues = normalizeWheel(event)
      const axes = inputSourceComponent.source.gamepad!.axes as number[]
      axes[0] = normalizedValues.spinX
      axes[1] = normalizedValues.spinY
    }
    document.addEventListener('wheel', onWheelEvent, { passive: true, capture: true })

    return () => {
      document.removeEventListener('DOMMouseScroll', preventDefault, false)
      document.removeEventListener('gesturestart', preventDefault)
      document.removeEventListener('keyup', onKeyEvent)
      document.removeEventListener('keydown', onKeyEvent)
      document.removeEventListener('touchstickmove', handleTouchDirectionalPad)
      document.removeEventListener('wheel', onWheelEvent)
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
  const canvasEntity = useEntityContext()
  const xrState = useMutableState(XRState)
  useEffect(() => {
    if (xrState.session.value) return // pointer input sources are automatically handled by webxr

    const rendererComponent = getComponent(canvasEntity, RendererComponent)
    const canvas = rendererComponent.canvas

    canvas.addEventListener('dragstart', preventDefault, false)
    canvas.addEventListener('contextmenu', preventDefault)

    // TODO: follow this spec more closely https://immersive-web.github.io/webxr/#transient-input
    // const pointerEntities = new Map<number, Entity>()

    const emulatedInputSourceEntity = createEntity()
    setComponent(emulatedInputSourceEntity, NameComponent, 'InputSource-emulated-pointer')
    setComponent(emulatedInputSourceEntity, TransformComponent)
    setComponent(emulatedInputSourceEntity, InputSourceComponent)
    const inputSourceComponent = getComponent(emulatedInputSourceEntity, InputSourceComponent)

    /** Clear mouse events */
    const pointerButtons = ['PrimaryClick', 'AuxiliaryClick', 'SecondaryClick']
    const clearPointerState = () => {
      const state = inputSourceComponent.buttons as ButtonStateMap
      for (const button of pointerButtons) {
        const val = state[button]
        if (!val?.up && val?.pressed) state[button].up = true
      }
    }

    const pointerEnter = (event: PointerEvent) => {
      setComponent(emulatedInputSourceEntity, InputPointerComponent, {
        pointerId: event.pointerId,
        canvasEntity: canvasEntity
      })
    }

    const pointerLeave = (event: PointerEvent) => {
      const pointerComponent = getOptionalComponent(emulatedInputSourceEntity, InputPointerComponent)
      if (!pointerComponent || pointerComponent?.pointerId !== event.pointerId) return
      clearPointerState()
      removeComponent(emulatedInputSourceEntity, InputPointerComponent)
    }

    canvas.addEventListener('pointerenter', pointerEnter)
    canvas.addEventListener('pointerleave', pointerLeave)

    canvas.addEventListener('blur', clearPointerState)
    canvas.addEventListener('mouseleave', clearPointerState)
    const handleVisibilityChange = (event: Event) => {
      if (document.visibilityState === 'hidden') clearPointerState()
    }
    canvas.addEventListener('visibilitychange', handleVisibilityChange)

    const handleMouseClick = (event: MouseEvent) => {
      const down = event.type === 'mousedown' || event.type === 'touchstart'

      let button = MouseButton.PrimaryClick
      if (event.button === 1) button = MouseButton.AuxiliaryClick
      else if (event.button === 2) button = MouseButton.SecondaryClick

      const inputSourceComponent = getOptionalComponent(emulatedInputSourceEntity, InputSourceComponent)
      if (!inputSourceComponent) return

      const state = inputSourceComponent.buttons as ButtonStateMap

      if (down) state[button] = createInitialButtonState()
      else if (state[button]) state[button]!.up = true
    }

    const handleMouseMove = (event: MouseEvent) => {
      const pointerComponent = getOptionalComponent(emulatedInputSourceEntity, InputPointerComponent)
      if (!pointerComponent) return
      pointerComponent.position.set(
        ((event.clientX - canvas.getBoundingClientRect().x) / canvas.clientWidth) * 2 - 1,
        ((event.clientY - canvas.getBoundingClientRect().y) / canvas.clientHeight) * -2 + 1
      )
    }

    const handleTouchMove = (event: TouchEvent) => {
      const pointerComponent = getOptionalComponent(emulatedInputSourceEntity, InputPointerComponent)
      if (!pointerComponent) return
      const touch = event.touches[0]
      pointerComponent.position.set(
        ((touch.clientX - canvas.getBoundingClientRect().x) / canvas.clientWidth) * 2 - 1,
        ((touch.clientY - canvas.getBoundingClientRect().y) / canvas.clientHeight) * -2 + 1
      )
    }

    canvas.addEventListener('touchmove', handleTouchMove, { passive: true, capture: true })
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true, capture: true })
    canvas.addEventListener('mouseup', handleMouseClick)
    canvas.addEventListener('mousedown', handleMouseClick)
    canvas.addEventListener('touchstart', handleMouseClick)
    canvas.addEventListener('touchend', handleMouseClick)

    return () => {
      canvas.removeEventListener('dragstart', preventDefault, false)
      canvas.removeEventListener('contextmenu', preventDefault)
      canvas.removeEventListener('pointerenter', pointerEnter)
      canvas.removeEventListener('pointerleave', pointerLeave)
      canvas.removeEventListener('blur', clearPointerState)
      canvas.removeEventListener('mouseleave', clearPointerState)
      canvas.removeEventListener('visibilitychange', handleVisibilityChange)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseClick)
      canvas.removeEventListener('mousedown', handleMouseClick)
      canvas.removeEventListener('touchstart', handleMouseClick)
      canvas.removeEventListener('touchend', handleMouseClick)
      removeEntity(emulatedInputSourceEntity)
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
      const state = inputSourceComponent.buttons as ButtonStateMap
      state.PrimaryClick = createInitialButtonState()
    }
    const onXRSelectEnd = (event: XRInputSourceEvent) => {
      const eid = InputSourceComponent.entitiesByInputSource.get(event.inputSource)
      if (!eid) return
      const inputSourceComponent = getComponent(eid, InputSourceComponent)
      if (!inputSourceComponent) return
      const state = inputSourceComponent.buttons as ButtonStateMap
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

function cleanupButton(key: string, buttons: ButtonStateMap, hasFocus: boolean) {
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
    if (!hasComponent(eid, XRSpaceComponent)) {
      ;(source.source.gamepad!.axes as number[]).fill(0)
    }
  }
}

export const ClientInputCleanupSystem = defineSystem({
  uuid: 'ee.engine.input.ClientInputCleanupSystem',
  insert: { after: PresentationSystemGroup },
  execute: cleanupInputs
})
