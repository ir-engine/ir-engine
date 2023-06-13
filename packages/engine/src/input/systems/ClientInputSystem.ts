import { get } from 'lodash'
import { useEffect } from 'react'
import { Intersection, Mesh, MeshBasicMaterial, Object3D, Quaternion, Ray, Raycaster, Vector3 } from 'three'

import { dispatchAction, getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'

import { V_00, V_001 } from '../../common/constants/MathConstants'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeQuery,
  setComponent,
  useQuery
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { InteractState } from '../../interaction/systems/InteractiveSystem'
import { Physics, RaycastArgs } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { AllCollisionMask, CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { SceneQueryType } from '../../physics/types/PhysicsTypes'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { XRSpaceComponent } from '../../xr/XRComponents'
import { ReferenceSpace, XRState } from '../../xr/XRState'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { pointers } from '../../xrui/systems/XRUISystem'
import { InputComponent } from '../components/InputComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'
import normalizeWheel from '../functions/normalizeWheel'
import { createInitialButtonState, OldButtonInputStateType, OldButtonTypes } from '../InputState'

function preventDefault(e) {
  e.preventDefault()
}

interface ListenerBindingData {
  domElement: any
  eventName: string
  callback: (event) => void
}

const boundListeners: ListenerBindingData[] = []

export const addClientInputListeners = () => {
  if (!isClient) return
  const canvas = EngineRenderer.instance.canvas

  window.addEventListener('DOMMouseScroll', preventDefault, false)
  window.addEventListener(
    'keydown',
    (evt) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (evt.code === 'Tab') evt.preventDefault()
      // prevent DOM tab selection and spacebar/enter button toggling (since it interferes with avatar controls)
      if (evt.code === 'Space' || evt.code === 'Enter') evt.preventDefault()
    },
    false
  )

  const addListener = (
    domElement: HTMLElement | Document | Window,
    eventName,
    callback: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ) => {
    domElement.addEventListener(eventName, callback, options)
    boundListeners.push({
      domElement,
      eventName,
      callback
    })
  }

  addListener(document, 'gesturestart', preventDefault)
  addListener(canvas, 'contextmenu', preventDefault)

  const handleMouseClick = (event: MouseEvent) => {
    const down = event.type === 'mousedown' || event.type === 'touchstart'

    let button: OldButtonTypes = 'PrimaryClick'
    if (event.button === 1) button = 'AuxiliaryClick'
    else if (event.button === 2) button = 'SecondaryClick'

    const state = Engine.instance.buttons as OldButtonInputStateType

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

  addListener(window, 'touchmove', handleTouchMove, { passive: true, capture: true })
  addListener(window, 'mousemove', handleMouseMove, { passive: true, capture: true })
  addListener(canvas, 'mouseup', handleMouseClick)
  addListener(canvas, 'mousedown', handleMouseClick)
  addListener(canvas, 'touchstart', handleMouseClick)
  addListener(canvas, 'touchend', handleMouseClick)

  const handleTouchDirectionalPad = (event: CustomEvent): void => {
    const { stick, value }: { stick: 'StickLeft' | 'StickRight'; value: { x: number; y: number } } = event.detail
    if (!stick) {
      return
    }

    // TODO: This is a hack to support gamepad input in WebXR AR sessions
    const index = 0 //Engine.instance.inputSources.length === 1 || stick === 'StickLeft' ? 0 : 1
    const inputSource = Engine.instance.inputSources[index]

    const axes = inputSource.gamepad!.axes as number[]

    axes[0] = value.x
    axes[1] = value.y
  }
  addListener(document, 'touchstickmove', handleTouchDirectionalPad)

  const handleTouchGampadButton = () => {
    dispatchAction(
      EngineActions.interactedWithObject({
        targetEntity: getState(InteractState).available[0],
        handedness: 'none'
      })
    )
  }
  addListener(document, 'touchgamepadbuttondown', handleTouchGampadButton)

  const pointerButtons = ['PrimaryClick', 'AuxiliaryClick', 'SecondaryClick']
  const clearKeyState = () => {
    const state = Engine.instance.buttons as OldButtonInputStateType
    for (const button of pointerButtons) {
      const val = state[button]
      if (!val?.up && val?.pressed) state[button].up = true
    }
  }
  addListener(window, 'focus', clearKeyState)
  addListener(window, 'blur', clearKeyState)
  addListener(canvas, 'mouseleave', clearKeyState)

  const handleVisibilityChange = (event: Event) => {
    if (document.visibilityState === 'hidden') clearKeyState()
  }

  addListener(document, 'visibilitychange', handleVisibilityChange)

  /** new */
  const onKeyEvent = (event: KeyboardEvent) => {
    const element = event.target as HTMLElement
    // Сheck which excludes the possibility of controlling the avatar when typing in a text field
    if (element?.tagName === 'INPUT' || element?.tagName === 'SELECT' || element?.tagName === 'TEXTAREA') return

    const code = event.code
    const down = event.type === 'keydown'

    if (down) Engine.instance.buttons[code] = createInitialButtonState()
    else if (Engine.instance.buttons[code]) Engine.instance.buttons[code].up = true
  }
  addListener(document, 'keyup', onKeyEvent)
  addListener(document, 'keydown', onKeyEvent)

  const onWheelEvent = (event: WheelEvent) => {
    const normalizedValues = normalizeWheel(event)
    const x = Math.sign(normalizedValues.spinX + Math.random() * 0.000001)
    const y = Math.sign(normalizedValues.spinY + Math.random() * 0.000001)
    Engine.instance.pointerState.scroll.x += x
    Engine.instance.pointerState.scroll.y += y
  }
  addListener(canvas, 'wheel', onWheelEvent, { passive: true, capture: true })
}

export const removeClientInputListeners = () => {
  // if not client, no listeners will exist
  if (!boundListeners.length) return

  window.removeEventListener('DOMMouseScroll', preventDefault, false)

  boundListeners.forEach(({ domElement, eventName, callback }) => {
    domElement.removeEventListener(eventName, callback)
  })
  boundListeners.splice(0, boundListeners.length - 1)
}

export const OldGamepadMapping = {
  //https://w3c.github.io/gamepad/#remapping
  standard: {
    0: 'ButtonA',
    1: 'ButtonB',
    2: 'ButtonX',
    3: 'ButtonY',
    4: 'LeftBumper',
    5: 'RightBumper',
    6: 'LeftTrigger',
    7: 'RightTrigger',
    8: 'ButtonBack',
    9: 'ButtonStart',
    10: 'LeftStick',
    11: 'RightStick',
    12: 'DPad1',
    13: 'DPad2',
    14: 'DPad3',
    15: 'DPad4'
  },
  //https://www.w3.org/TR/webxr-gamepads-module-1/
  'xr-standard': {
    left: {
      0: 'LeftTrigger',
      1: 'LeftBumper',
      2: 'LeftPad',
      3: 'LeftStick',
      4: 'ButtonX',
      5: 'ButtonY'
    },
    right: {
      0: 'RightTrigger',
      1: 'RightBumper',
      2: 'RightPad',
      3: 'RightStick',
      4: 'ButtonA',
      5: 'ButtonB'
    },
    none: {
      0: 'RightTrigger',
      1: 'RightBumper',
      2: 'RightPad',
      3: 'RightStick',
      4: 'ButtonA',
      5: 'ButtonB'
    }
  }
}
export function updateOldGamepadInput(source: XRInputSource) {
  if (!source.gamepad) return
  if (source.gamepad.mapping in OldGamepadMapping) {
    const ButtonAlias = OldGamepadMapping[source.gamepad!.mapping]
    const mapping = ButtonAlias[source.handedness]
    const buttons = source.gamepad?.buttons
    if (buttons) {
      for (let i = 0; i < buttons.length; i++) {
        const buttonMapping = mapping[i]
        const button = buttons[i]
        if (!Engine.instance.buttons[buttonMapping] && (button.pressed || button.touched)) {
          Engine.instance.buttons[buttonMapping] = createInitialButtonState(button)
        }
        if (Engine.instance.buttons[buttonMapping] && (button.pressed || button.touched)) {
          if (!Engine.instance.buttons[buttonMapping].pressed && button.pressed)
            Engine.instance.buttons[buttonMapping].down = true
          Engine.instance.buttons[buttonMapping].pressed = button.pressed
          Engine.instance.buttons[buttonMapping].touched = button.touched
          Engine.instance.buttons[buttonMapping].value = button.value
        } else if (Engine.instance.buttons[buttonMapping]) {
          Engine.instance.buttons[buttonMapping].up = true
        }
      }
    }
  }
}

export const GamepadMapping = {
  //https://w3c.github.io/gamepad/#remapping
  standard: {
    0: 'ButtonA',
    1: 'ButtonB',
    2: 'ButtonX',
    3: 'ButtonY',
    4: 'LeftBumper',
    5: 'RightBumper',
    6: 'LeftTrigger',
    7: 'RightTrigger',
    8: 'ButtonBack',
    9: 'ButtonStart',
    10: 'LeftStick',
    11: 'RightStick',
    12: 'DPad1',
    13: 'DPad2',
    14: 'DPad3',
    15: 'DPad4'
  },
  //https://www.w3.org/TR/webxr-gamepads-module-1/
  'xr-standard': {
    0: 'Trigger',
    1: 'Squeeze',
    2: 'Pad',
    3: 'Stick',
    4: 'ButtonA',
    5: 'ButtonB'
  }
}

export function updateGamepadInput(eid: Entity) {
  const inputSource = getComponent(eid, InputSourceComponent)
  const source = inputSource.source
  const buttons = inputSource.buttons
  if (!source.gamepad) return
  if (source.gamepad.mapping in GamepadMapping) {
    const ButtonAlias = GamepadMapping[source.gamepad!.mapping]
    const gamepadButtons = source.gamepad?.buttons
    if (gamepadButtons) {
      for (let i = 0; i < gamepadButtons.length; i++) {
        const buttonMapping = ButtonAlias[i]
        const button = gamepadButtons[i]
        if (!buttons[buttonMapping] && (button.pressed || button.touched)) {
          buttons[buttonMapping] = createInitialButtonState(button)
        }
        if (buttons[buttonMapping] && (button.pressed || button.touched)) {
          if (!buttons[buttonMapping].pressed && button.pressed) buttons[buttonMapping].down = true
          buttons[buttonMapping].pressed = button.pressed
          buttons[buttonMapping].touched = button.touched
          buttons[buttonMapping].value = button.value
        } else if (buttons[buttonMapping]) {
          buttons[buttonMapping].up = true
        }
      }
    }
  }
}

const xrSpaces = defineQuery([XRSpaceComponent, TransformComponent])
const inputSources = defineQuery([InputSourceComponent])

const inputXRUIs = defineQuery([InputComponent, XRUIComponent])
const inputRigidbodies = defineQuery([InputComponent, RigidBodyComponent])

const boxCenter = new Vector3()
const rayRotation = new Quaternion()

const inputRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 1000,
  groups: getInteractionGroups(AllCollisionMask, AllCollisionMask),
  excludeRigidBody: null
} as RaycastArgs

const inputRay = new Ray()

// const raycaster = new Raycaster()
// raycaster.layers.enable(ObjectLayers.Scene)
// raycaster.layers.enable(ObjectLayers.Avatar)
// raycaster.layers.enable(ObjectLayers.UI)
// const intersects = [] as Intersection<Object3D>[]

// check for intersections, returning as soon as one is found
// function _findFirstIntersection(objects: Object3D[]) {
//   for (const object of objects) {
//     traverseObjectEarlyOut(object, _checkIntersection)
//     if (intersects.length > 0) return intersects[0]
//   }
//   return null
// }

// function _checkIntersection(obj:Mesh) {
//   intersects.length = 0
//   if (obj.visible === false || (obj.material as MeshBasicMaterial)?.opacity < 0.001) return false
//   if (obj.layers.test(raycaster.layers)) {
//     obj.raycast(raycaster, intersects)
//     if (intersects.length > 0) return true
//   }
//   return false
// }

// function traverseObjectEarlyOut(object: Object3D, callback: (obj: Object3D) => boolean) {
//   if (callback(object)) return true
//   for (const child of object.children) {
//     if (traverseObjectEarlyOut(child, callback)) return true
//   }
//   return false
// }

const execute = () => {
  for (const source of Engine.instance.inputSources) updateOldGamepadInput(source)

  Engine.instance.pointerScreenRaycaster.setFromCamera(Engine.instance.pointerState.position, Engine.instance.camera)

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
    if (!(space instanceof XRSpace)) continue
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
      rayRotation.setFromUnitVectors(V_001, ray.direction)

      TransformComponent.rotation.x[sourceEid] = rayRotation.x
      TransformComponent.rotation.y[sourceEid] = rayRotation.y
      TransformComponent.rotation.z[sourceEid] = rayRotation.z
      TransformComponent.rotation.w[sourceEid] = rayRotation.w
      TransformComponent.dirtyTransforms[sourceEid] = true
    }

    if (!source.captured.value) {
      let assignedInputEntity = UndefinedEntity as Entity

      inputRaycast.direction.set(0, 0, 1).applyQuaternion(sourceTransform.rotation)
      inputRaycast.origin.copy(sourceTransform.position).addScaledVector(inputRaycast.direction, -0.01)
      inputRaycast.excludeRigidBody = getOptionalComponent(Engine.instance.localClientEntity, RigidBodyComponent)?.body
      inputRay.set(inputRaycast.origin, inputRaycast.direction)

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

      if (Engine.instance.physicsWorld && !assignedInputEntity) {
        const hit = Physics.castRay(Engine.instance.physicsWorld, inputRaycast)[0]
        if (hit) assignedInputEntity = hit.entity
      }

      source.assignedEntity.set(assignedInputEntity)
    }

    if (!xrFrame && source.source.targetRayMode.value === 'screen') {
      source.buttons.set(Engine.instance.buttons)
    } else {
      updateGamepadInput(sourceEid)
    }
  }
}

const reactor = () => {
  const xrState = useHookstate(getMutableState(XRState))

  useEffect(() => {
    addClientInputListeners()
    Engine.instance.pointerScreenRaycaster.layers.enableAll()

    return () => {
      removeClientInputListeners()
    }
  }, [])

  useEffect(() => {
    const addInputSource = (source: XRInputSource) => {
      const entity = createEntity()
      setComponent(entity, InputSourceComponent, { source })
      setComponent(entity, NameComponent, 'InputSource-handed:' + source.handedness + '-mode:' + source.targetRayMode)
    }
    const removeInputSource = (source: XRInputSource) =>
      removeEntity(InputSourceComponent.entitiesByInputSource.get(source))

    Engine.instance.inputSources.map(addInputSource)

    const session = xrState.session.value

    const onInputSourcesChanged = (event: XRInputSourceChangeEvent) => {
      event.added.map(addInputSource)
      event.removed.map(removeInputSource)
    }

    session?.addEventListener('inputsourceschange', onInputSourcesChanged)

    return () => {
      const inputSourceEntities = defineQuery([InputSourceComponent])
      inputSourceEntities().map((eid) => removeEntity(eid))
      removeQuery(inputSourceEntities)
      session?.removeEventListener('inputsourceschange', onInputSourcesChanged)
    }
  }, [xrState.session])

  return null
}

export const ClientInputSystem = defineSystem({
  uuid: 'ee.engine.input.ClientInputSystem',
  execute,
  reactor
})
