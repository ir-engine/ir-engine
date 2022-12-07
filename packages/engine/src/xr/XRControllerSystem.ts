import {
  AdditiveBlending,
  AxesHelper,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry
} from 'three'

import { dispatchAction, getState } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { Entity, UndefinedEntity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import {
  defineQuery,
  getComponent,
  getComponentState,
  removeQuery,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../ecs/functions/EntityFunctions'
import { createInitialButtonState } from '../input/InputState'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { setObjectLayers } from '../scene/functions/setObjectLayers'
import { LocalTransformComponent, setLocalTransformComponent } from '../transform/components/TransformComponent'
import {
  InputSourceComponent,
  PointerObject,
  XRControllerComponent,
  XRControllerGripComponent,
  XRHand,
  XRHandComponent,
  XRPointerComponent
} from './XRComponents'
import { getXRAvatarControlMode, XRAction, XRState } from './XRState'

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createPointer = (inputSource: XRInputSource): PointerObject => {
  switch (inputSource.targetRayMode) {
    case 'gaze': {
      const geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
      const material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
      return new Mesh(geometry, material) as PointerObject
    }
    default:
    case 'tracked-pointer': {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
      geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))
      const material = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending })
      return new Line(geometry, material)
    }
  }
}

const createUICursor = () => {
  const geometry = new SphereGeometry(0.01, 16, 16)
  const material = new MeshBasicMaterial({ color: 0xffffff })
  return new Mesh(geometry, material)
}

const updateInputSource = (entity: Entity, space: XRSpace, referenceSpace: XRReferenceSpace) => {
  const pose = Engine.instance.xrFrame!.getPose(space, referenceSpace)
  setVisibleComponent(entity, !!pose)
  if (!pose) return
  const transform = getComponent(entity, LocalTransformComponent)
  transform.position.copy(pose.transform.position as any)
  transform.rotation.copy(pose.transform.orientation as any)
}

const ButtonAlias = {
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
  }
}

export function updateGamepadInput(world: World, source: XRInputSource) {
  if (source.gamepad?.mapping === 'xr-standard') {
    const mapping = ButtonAlias[source.handedness]
    const buttons = source.gamepad?.buttons
    if (buttons) {
      for (let i = 0; i < buttons.length; i++) {
        const buttonMapping = mapping[i]
        const button = buttons[i]
        if (!world.buttons[buttonMapping] && (button.pressed || button.touched)) {
          world.buttons[buttonMapping] = createInitialButtonState(button)
        }
        if (world.buttons[buttonMapping] && (button.pressed || button.touched)) {
          world.buttons[buttonMapping].pressed = button.pressed
          world.buttons[buttonMapping].touched = button.touched
          world.buttons[buttonMapping].value = button.value
        } else if (world.buttons[buttonMapping]) {
          world.buttons[buttonMapping].up = true
        }
      }
    }
  }
}

const addInputSourceEntity = (inputSource: XRInputSource, targetRaySpace: XRSpace) => {
  const xrState = getState(XRState)
  console.log('[XRControllerSystem]: found input source', inputSource)
  const entity = createEntity()
  const handednessLabel =
    inputSource.handedness === 'none' ? '' : inputSource.handedness === 'left' ? ' Left' : ' Right'
  setComponent(entity, NameComponent, `XR Controller${handednessLabel}`)
  const pointer = createPointer(inputSource)
  addObjectToGroup(entity, pointer)
  setComponent(entity, XRPointerComponent, { pointer })
  const cursor = createUICursor()
  pointer.cursor = cursor
  pointer.add(cursor)
  cursor.visible = false
  const world = Engine.instance.currentWorld
  setLocalTransformComponent(entity, world.originEntity)

  setComponent(entity, XRControllerComponent, {
    targetRaySpace,
    handedness: inputSource.handedness,
    grip: null,
    hand: null
  })
  setComponent(entity, InputSourceComponent, { inputSource })
  xrInputSourcesMap.set(inputSource, entity)!
  const targetRayHelper = new AxesHelper(1)
  setObjectLayers(targetRayHelper, ObjectLayers.PhysicsHelper)
  addObjectToGroup(entity, targetRayHelper)

  if (inputSource.targetRayMode === 'screen') xrState.viewerInputSourceEntity.set(entity)
  if (inputSource.handedness === 'left') xrState.leftControllerEntity.set(entity)
  if (inputSource.handedness === 'right') xrState.rightControllerEntity.set(entity)

  return entity
}

const addGripInputSource = (inputSource: XRInputSource, gripSpace: XRSpace) => {
  const gripEntity = createEntity()
  setComponent(gripEntity, XRControllerGripComponent, { gripSpace, handedness: inputSource.handedness })
  setComponent(gripEntity, InputSourceComponent, { inputSource })
  const world = Engine.instance.currentWorld
  setLocalTransformComponent(gripEntity, world.originEntity)
  setComponent(gripEntity, NameComponent, `XR Grip${inputSource.handedness}`)
  // initializeControllerModel(gripEntity)
  const gripAxisHelper = new AxesHelper(1)
  setObjectLayers(gripAxisHelper, ObjectLayers.PhysicsHelper)
  addObjectToGroup(gripEntity, gripAxisHelper)
  return gripEntity
}

const addHandInputSource = (inputSource: XRInputSource, hand: XRHand) => {
  const handEntity = createEntity()
  setComponent(handEntity, XRHandComponent, { hand, handedness: inputSource.handedness })
  setComponent(handEntity, InputSourceComponent, { inputSource })
  setComponent(handEntity, NameComponent, `XR Hand ${inputSource.handedness}`)
  // initializeHandModel(handEntity)
  const world = Engine.instance.currentWorld
  setLocalTransformComponent(handEntity, world.originEntity)
  const handAxisHelper = new AxesHelper(1)
  setObjectLayers(handAxisHelper, ObjectLayers.PhysicsHelper)
  addObjectToGroup(handEntity, handAxisHelper)
  return handEntity
}

const removeInputSourceEntity = (inputSource: XRInputSource) => {
  const xrState = getState(XRState)
  if (!xrInputSourcesMap.has(inputSource)) return
  console.log('[XRControllerSystem]: lost input source', inputSource)
  if (inputSource.targetRayMode === 'screen') xrState.viewerInputSourceEntity.set(UndefinedEntity)
  if (inputSource.handedness === 'left') xrState.leftControllerEntity.set(UndefinedEntity)
  if (inputSource.handedness === 'right') xrState.rightControllerEntity.set(UndefinedEntity)
  const controllerEntity = xrInputSourcesMap.get(inputSource)!
  const controller = getComponent(controllerEntity, XRControllerComponent)
  if (controller.grip) {
    xrGripInputSourcesMap.delete(getComponent(controller.grip, XRControllerGripComponent).gripSpace)
    removeEntity(controller.grip)
  }
  if (controller.hand) {
    xrHandInputSourcesMap.delete(getComponent(controller.hand, XRHandComponent).hand)
    removeEntity(controller.hand)
  }
  removeEntity(controllerEntity)
  // todo, remove grip and hand entities too
  xrInputSourcesMap.delete(inputSource)
}

const updateInputSourceEntities = () => {
  const inputSources = Engine.instance.xrFrame?.session ? Engine.instance.xrFrame.session.inputSources : []
  let changed = false
  for (const inputSource of inputSources) {
    let targetRaySpace = inputSource.targetRaySpace
    let gripSpace = inputSource.gripSpace
    let hand = inputSource.hand

    // Some runtimes (namely Vive Cosmos with Vive OpenXR Runtime) have only grip space and ray space is equal to it
    if (gripSpace && !targetRaySpace) {
      targetRaySpace = gripSpace
      gripSpace = null!
    }

    if (targetRaySpace && !xrInputSourcesMap.has(inputSource)) {
      addInputSourceEntity(inputSource, targetRaySpace)
      changed = true
    }

    const controllerEntity = xrInputSourcesMap.get(inputSource)!
    const controller = getComponent(controllerEntity, XRControllerComponent)

    if (gripSpace && !controller.grip) {
      const gripEntity = addGripInputSource(inputSource, gripSpace)
      getComponentState(controllerEntity, XRControllerComponent).grip.set(gripEntity)
      changed = true
    }

    if (hand && !controller.hand) {
      const handEntity = addHandInputSource(inputSource, hand as any as XRHand) /** typescript typing is incorrect */
      getComponentState(controllerEntity, XRControllerComponent).hand.set(handEntity)
      changed = true
    }

    if (!gripSpace && controller.grip) {
      xrGripInputSourcesMap.delete(getComponent(controller.grip, XRControllerGripComponent).gripSpace)
      removeEntity(controller.grip)
      getComponentState(controllerEntity, XRControllerComponent).grip.set(UndefinedEntity)
      changed = true
    }

    if (!hand && controller.hand) {
      xrHandInputSourcesMap.delete(getComponent(controller.hand, XRHandComponent).hand)
      removeEntity(controller.hand)
      getComponentState(controllerEntity, XRControllerComponent).hand.set(UndefinedEntity)
      changed = true
    }
  }

  for (const [inputSource] of xrInputSourcesMap) {
    let includes = false
    for (const source of inputSources) {
      if (source === inputSource) {
        includes = true
        break
      }
    }
    if (!includes) {
      removeInputSourceEntity(inputSource)
      changed = true
    }
  }

  if (changed) {
    const xrState = getState(XRState)
    dispatchAction(
      WorldNetworkAction.avatarIKTargets({
        head: !!(getXRAvatarControlMode() === 'attached' ? true : xrState.viewerInputSourceEntity.value),
        leftHand: !!xrState.leftControllerEntity.value,
        rightHand: !!xrState.rightControllerEntity.value
      })
    )
  }
}

export const xrInputSourcesMap = new Map<XRInputSource, Entity>()
export const xrGripInputSourcesMap = new Map<XRSpace, Entity>()
export const xrHandInputSourcesMap = new Map<XRHand, Entity>()

export default async function XRControllerSystem(world: World) {
  const controllerQuery = defineQuery([XRControllerComponent])
  const gripQuery = defineQuery([XRControllerGripComponent])
  const handQuery = defineQuery([XRHandComponent])

  const targetRaySpace = {} as XRSpace

  const screenInputSource = {
    handedness: 'none',
    targetRayMode: 'screen',
    targetRaySpace,
    gripSpace: undefined,
    gamepad: {
      axes: new Array(2).fill(0),
      buttons: [],
      connected: true,
      hapticActuators: [],
      id: '',
      index: 0,
      mapping: 'xr-standard',
      timestamp: Date.now()
    },
    profiles: [],
    hand: undefined
  }
  const defaultInputSourceArray = [screenInputSource] as XRInputSourceArray

  const execute = () => {
    updateInputSourceEntities()

    if (Engine.instance.xrFrame) {
      const session = Engine.instance.xrFrame.session
      for (const source of session.inputSources) updateGamepadInput(world, source)

      const referenceSpace = EngineRenderer.instance.xrManager.getReferenceSpace()
      if (referenceSpace) {
        for (const entity of controllerQuery()) {
          const { targetRaySpace } = getComponent(entity, XRControllerComponent)
          updateInputSource(entity, targetRaySpace, referenceSpace)
        }

        for (const entity of gripQuery()) {
          const { gripSpace } = getComponent(entity, XRControllerGripComponent)
          updateInputSource(entity, gripSpace, referenceSpace)
        }
      }

      world.inputSources = session.inputSources
    } else {
      world.inputSources = defaultInputSourceArray
      const now = Date.now()
      screenInputSource.gamepad.timestamp = now
    }
  }

  const cleanup = async () => {
    removeQuery(world, controllerQuery)
    removeQuery(world, gripQuery)
    removeQuery(world, handQuery)
  }

  return { execute, cleanup }
}
