import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry
} from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../ecs/functions/EntityFunctions'
import { setVelocityComponent, VelocityComponent } from '../physics/components/VelocityComponent'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { setVisibleComponent } from '../scene/components/VisibleComponent'
import {
  setLocalTransformComponent,
  setTransformComponent,
  TransformComponent
} from '../transform/components/TransformComponent'
import {
  XRControllerComponent,
  XRControllerGripComponent,
  XRHandComponent,
  XRInputSourceComponent
} from './XRComponents'
import { initializeControllerModel, initializeHandModel } from './XRControllerFunctions'
import { XRAction } from './XRState'

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createController = (inputSource: XRInputSource) => {
  let geometry, material
  switch (inputSource.targetRayMode) {
    case 'tracked-pointer':
      geometry = new BoxGeometry(0.005, 0.005, 0.25)
      const positions = geometry.attributes.position
      const count = positions.count
      geometry.setAttribute('color', new BufferAttribute(new Float32Array(count * 3), 3))
      const colors = geometry.attributes.color

      for (let i = 0; i < count; i++) {
        if (positions.getZ(i) < 0) colors.setXYZ(i, 0, 0, 0)
        else colors.setXYZ(i, 0.5, 0.5, 0.5)
      }

      material = new MeshBasicMaterial({ color: 0xffffff, vertexColors: true, blending: AdditiveBlending })
      const mesh = new Mesh(geometry, material)
      mesh.position.z = -0.125
      return mesh

    case 'gaze':
      geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
      material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
      return new Mesh(geometry, material)
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
  transform.matrix.fromArray(pose.transform.matrix)
  transform.matrix.decompose(transform.position, transform.rotation, transform.scale)

  // @ts-ignore
  if (pose.linearVelocity) velocity.linear.copy(pose.linearVelocity)

  // @ts-ignore
  if (pose.angularVelocity) velocity.angular.copy(pose.angularVelocity)
}

export const xrInputSourcesMap = new Map<XRInputSource, Entity>()

export default async function XRControllerSystem(world: World) {
  const onInputSourcesChange = ({ removed, added }: XRInputSourceChangeEvent) => {
    for (const inputSource of removed) {
      removeEntity(xrInputSourcesMap.get(inputSource)!)
      xrInputSourcesMap.delete(inputSource)
    }

    for (const inputSource of added) {
      let targetRaySpace = inputSource.targetRaySpace
      let gripSpace = inputSource.gripSpace
      let hand = inputSource.hand

      // Some runtimes (namely Vive Cosmos with Vive OpenXR Runtime) have only grip space and ray space is equal to it
      if (gripSpace && !targetRaySpace) {
        targetRaySpace = gripSpace
        gripSpace = null!
      }

      const entity = createEntity()
      const handednessLabel =
        inputSource.handedness === 'none' ? '' : inputSource.handedness === 'left' ? ' Left' : ' Right'
      setComponent(entity, NameComponent, { name: `XR Controller${handednessLabel}` })
      setTransformComponent(entity)
      setLocalTransformComponent(entity, world.localClientEntity)
      const pointer = createController(inputSource)
      if (pointer) addObjectToGroup(entity, pointer)

      // controller.targetRay = targetRay
      setComponent(entity, XRControllerComponent, { targetRaySpace, handedness: inputSource.handedness })
      setVelocityComponent(entity)
      xrInputSourcesMap.set(inputSource, entity)!

      if (gripSpace) {
        const gripEntity = createEntity()
        setComponent(gripEntity, XRControllerGripComponent, { gripSpace, handedness: inputSource.handedness })
        setTransformComponent(gripEntity)
        setLocalTransformComponent(gripEntity, entity)
        setVelocityComponent(gripEntity)
        setComponent(gripEntity, NameComponent, { name: `XR Grip${handednessLabel}` })
        initializeControllerModel(entity)
      }

      if (hand) {
        const handEntity = createEntity()
        setComponent(handEntity, XRHandComponent, { hand, handedness: inputSource.handedness })
        setTransformComponent(handEntity)
        setLocalTransformComponent(handEntity, entity)
        setVelocityComponent(handEntity)
        setComponent(handEntity, NameComponent, { name: `XR Hand${handednessLabel}` })
        initializeHandModel(handEntity)
      }
    }
  }

  const controllerQuery = defineQuery([XRControllerComponent])
  const gripQuery = defineQuery([XRControllerGripComponent])
  const handQuery = defineQuery([XRHandComponent])
  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)

  const execute = () => {
    for (const action of xrSessionChangedQueue())
      if (action.active) EngineRenderer.instance.xrSession.addEventListener('inputsourceschange', onInputSourcesChange)

    if (Engine.instance.xrFrame) {
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

        for (const entity of handQuery()) updateHand(entity, referenceSpace)
      }
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
