import {
  AdditiveBlending,
  AxesHelper,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
  XRGripSpace
} from 'three'

import { dispatchAction, getState } from '@xrengine/hyperflux'

import { BinaryValue } from '../common/enums/BinaryValue'
import { LifecycleValue } from '../common/enums/LifecycleValue'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, removeQuery, setComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../ecs/functions/EntityFunctions'
import { GamepadAxis } from '../input/enums/InputEnums'
import { InputType } from '../input/enums/InputType'
import { GamepadMapping } from '../input/functions/GamepadInput'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { setVelocityComponent, VelocityComponent } from '../physics/components/VelocityComponent'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { setObjectLayers } from '../scene/functions/setObjectLayers'
import { TransformComponent } from '../transform/components/TransformComponent'
import {
  InputSourceComponent,
  PointerObject,
  XRControllerComponent,
  XRControllerGripComponent,
  XRHandComponent,
  XRPointerComponent
} from './XRComponents'
import { getControlMode, XRState } from './XRState'

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createPointer = (inputSource: XRInputSource): PointerObject => {
  switch (inputSource.targetRayMode) {
    case 'gaze': {
      const geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
      const material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
      return new Mesh(geometry, material)
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

const updateHand = (entity: Entity, referenceSpace: XRReferenceSpace) => {
  const frame = Engine.instance.xrFrame!

  // detect support for joints
  if (!frame.getJointPose) return

  const handComponent = getComponent(entity, XRHandComponent)
  const { hand, joints, group } = handComponent

  for (const inputjoint of hand.values()) {
    const jointPose = frame.getJointPose(inputjoint, referenceSpace)

    if (joints[inputjoint.jointName] === undefined) {
      const joint = new Group() as Group & { jointRadius: number | undefined }
      joint.matrixAutoUpdate = false
      joints[inputjoint.jointName] = joint
      group.add(joint)
    }

    const joint = joints[inputjoint.jointName]

    if (jointPose) {
      joint.matrix.fromArray(jointPose.transform.matrix)
      joint.matrix.decompose(joint.position, joint.quaternion, joint.scale)
      joint.jointRadius = jointPose.radius
    }

    joint.visible = jointPose !== null
  }

  /** The IK system uses the wrist joint as the hand target, so set the world transform to be where the wrist is */
  const wrist = joints['wrist']
  const transform = getComponent(entity, TransformComponent)
  transform.position.copy(wrist.position)
  transform.rotation.copy(wrist.quaternion)

  const indexTip = joints['index-finger-tip']
  const thumbTip = joints['thumb-tip']
  const distance = indexTip.position.distanceTo(thumbTip.position)

  const distanceToPinch = 0.02
  const threshold = 0.005

  if (handComponent.pinching && distance > distanceToPinch + threshold) {
    handComponent.pinching = false
  } else if (!handComponent.pinching && distance <= distanceToPinch - threshold) {
    handComponent.pinching = true
  }
}

const updateInputSource = (entity: Entity, space: XRSpace, referenceSpace: XRReferenceSpace) => {
  const pose = Engine.instance.xrFrame!.getPose(space, referenceSpace)
  setVisibleComponent(entity, !!pose)
  if (!pose) return

  const transform = getComponent(entity, TransformComponent)
  const velocity = getComponent(entity, VelocityComponent)
  transform.position.copy(pose.transform.position as any)
  transform.rotation.copy(pose.transform.orientation as any)
  // transform.matrix.fromArray(pose.transform.matrix)
  // transform.matrix.decompose(transform.position, transform.rotation, transform.scale)

  // @ts-ignore
  if (pose.linearVelocity) velocity.linear.copy(pose.linearVelocity)

  // @ts-ignore
  if (pose.angularVelocity) velocity.angular.copy(pose.angularVelocity)
}

export function updateGamepadInput(source: XRInputSource) {
  if (source.gamepad?.mapping === 'xr-standard') {
    const mapping = GamepadMapping['xr-standard'][source.handedness]

    source.gamepad.buttons.forEach((button, index) => {
      // TODO : support button.touched and button.value
      const prev = Engine.instance.currentWorld.prevInputState.has(mapping[index])
      Engine.instance.currentWorld.inputState.set(mapping[index], {
        type: InputType.BUTTON,
        value: [button.pressed ? BinaryValue.ON : BinaryValue.OFF],
        lifecycleState:
          prev && prev === button.pressed
            ? LifecycleValue.Unchanged
            : button.pressed
            ? LifecycleValue.Started
            : LifecycleValue.Ended
      })
    })

    // TODO: we shouldn't be modifying input data here, deadzone should be handled elsewhere
    const inputData = [...source.gamepad.axes]
    for (let i = 0; i < inputData.length; i++) {
      if (Math.abs(inputData[i]) < 0.05) inputData[i] = 0
    }

    // NOTE: we are inverting input here, as the avatar model is flipped 180 degrees. when that is solved, uninvert these gamepad inputs
    if (inputData.length >= 2) {
      const Touchpad = source.handedness === 'left' ? GamepadAxis.LTouchpad : GamepadAxis.RTouchpad

      Engine.instance.currentWorld.inputState.set(Touchpad, {
        type: InputType.TWODIM,
        value: [inputData[0], inputData[1]],
        lifecycleState: LifecycleValue.Started // TODO
      })
    }

    if (inputData.length >= 4) {
      const Thumbstick = source.handedness === 'left' ? GamepadAxis.LThumbstick : GamepadAxis.RThumbstick
      Engine.instance.currentWorld.inputState.set(Thumbstick, {
        type: InputType.TWODIM,
        value: [inputData[2], inputData[3]],
        lifecycleState: LifecycleValue.Started // TODO
      })
    }
  }
}

const addInputSourceEntity = (inputSource: XRInputSource, targetRaySpace: XRSpace) => {
  const xrState = getState(XRState)

  const entity = createEntity()
  const handednessLabel =
    inputSource.handedness === 'none' ? '' : inputSource.handedness === 'left' ? ' Left' : ' Right'
  setComponent(entity, NameComponent, { name: `XR Controller${handednessLabel}` })
  const pointer = createPointer(inputSource)
  addObjectToGroup(entity, pointer)
  setComponent(entity, XRPointerComponent, { pointer })
  const cursor = createUICursor()
  pointer.cursor = cursor
  pointer.add(cursor)
  cursor.visible = false

  // controller.targetRay = targetRay
  setComponent(entity, XRControllerComponent, {
    targetRaySpace,
    handedness: inputSource.handedness,
    grip: null,
    hand: null
  })
  setComponent(entity, InputSourceComponent, { inputSource })
  setVelocityComponent(entity)
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
  setVelocityComponent(gripEntity)
  setComponent(gripEntity, NameComponent, { name: `XR Grip${inputSource.handedness}` })
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
  setVelocityComponent(handEntity)
  setComponent(handEntity, NameComponent, { name: `XR Hand ${inputSource.handedness}` })
  // initializeHandModel(handEntity)
  const handAxisHelper = new AxesHelper(1)
  setObjectLayers(handAxisHelper, ObjectLayers.PhysicsHelper)
  addObjectToGroup(handEntity, handAxisHelper)
  return handEntity
}

const removeInputSourceEntity = (inputSource: XRInputSource) => {
  const xrState = getState(XRState)
  if (!xrInputSourcesMap.has(inputSource)) return
  if (inputSource.targetRayMode === 'screen') xrState.viewerInputSourceEntity.set(null)
  if (inputSource.handedness === 'left') xrState.leftControllerEntity.set(null)
  if (inputSource.handedness === 'right') xrState.rightControllerEntity.set(null)
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
  const inputSources = Engine.instance.xrFrame?.session ? Array.from(Engine.instance.xrFrame.session.inputSources) : []
  const existingInputSources = Array.from(xrInputSourcesMap).map(([is]) => is)
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

    if (targetRaySpace && !existingInputSources.includes(inputSource)) {
      addInputSourceEntity(inputSource, targetRaySpace)
      changed = true
    }

    const controllerEntity = xrInputSourcesMap.get(inputSource)!
    const controller = getComponent(controllerEntity, XRControllerComponent)

    if (gripSpace && !controller.grip) {
      const gripEntity = addGripInputSource(inputSource, gripSpace)
      controller.grip = gripEntity
      changed = true
    }

    if (hand && !controller.hand) {
      const handEntity = addHandInputSource(inputSource, hand)
      controller.hand = handEntity
      changed = true
    }

    if (!gripSpace && controller.grip) {
      xrGripInputSourcesMap.delete(getComponent(controller.grip, XRControllerGripComponent).gripSpace)
      removeEntity(controller.grip)
      controller.grip = null
      changed = true
    }

    if (!hand && controller.hand) {
      xrHandInputSourcesMap.delete(getComponent(controller.hand, XRHandComponent).hand)
      removeEntity(controller.hand)
      controller.hand = null
      changed = true
    }
  }

  for (const inputSource of existingInputSources) {
    if (!inputSources.includes(inputSource)) {
      removeInputSourceEntity(inputSource)
      changed = true
    }
  }

  if (changed) {
    const xrState = getState(XRState)
    dispatchAction(
      WorldNetworkAction.avatarIKTargets({
        head: !!(getControlMode() === 'attached' ? true : xrState.viewerInputSourceEntity.value),
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

  const execute = () => {
    updateInputSourceEntities()

    if (Engine.instance.xrFrame) {
      const session = Engine.instance.xrFrame.session
      for (const source of session.inputSources) updateGamepadInput(source)

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

        for (const entity of handQuery()) {
          updateHand(entity, referenceSpace)
        }
      }

      world.inputSources = [...session.inputSources.values()]
    } else {
      world.inputSources = []
    }
  }

  const cleanup = async () => {
    removeQuery(world, controllerQuery)
    removeQuery(world, gripQuery)
    removeQuery(world, handQuery)
  }

  return { execute, cleanup }
}
