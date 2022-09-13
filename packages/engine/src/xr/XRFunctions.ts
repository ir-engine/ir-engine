import { Group, Object3D, Quaternion, Vector3 } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { BoneNames } from '../avatar/AvatarBoneMatching'
import { AvatarAnimationComponent } from '../avatar/components/AvatarAnimationComponent'
import { ParityValue } from '../common/enums/ParityValue'
import { proxifyQuaternion, proxifyVector3 } from '../common/proxies/createThreejsProxy'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { TransformComponent } from '../transform/components/TransformComponent'
import {
  ControllerGroup,
  XRHandsInputComponent,
  XRInputSourceComponent,
  XRInputSourceComponentType
} from './XRComponents'
import { initializeHandModel } from './XRControllerFunctions'

const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

/**
 * Map XR input source controller groups to correct hand
 * Should be called before xr session creation
 * Call only once
 */
export const setupLocalXRInputs = () => {
  const world = Engine.instance.currentWorld
  const xr = EngineRenderer.instance.xrManager
  if (!xr) return
  const controllers = [xr.getController(0), xr.getController(1)]
  const controllerGrips = [xr.getControllerGrip(0), xr.getControllerGrip(1)]
  const hands = [xr.getHand(0), xr.getHand(1)]

  const assignController = (input: XRInputSourceComponentType, prop: string, controller: Object3D) => {
    const { parent } = input[prop]
    input[prop].removeFromParent()
    input[prop] = controller
    parent?.add(controller)
  }

  controllers.forEach((controller) => {
    controller.addEventListener('connected', function ({ data }) {
      const entity = world.localClientEntity
      const input = getComponent(entity, XRInputSourceComponent)

      if (data.handedness === 'left') {
        controller.add(input.controllerLeft)
        assignController(input, 'controllerLeftParent', controller)
        proxifyVector3(XRInputSourceComponent.controllerLeftParent.position, entity, controller.position)
        proxifyQuaternion(XRInputSourceComponent.controllerLeftParent.quaternion, entity, controller.quaternion)
      } else if (data.handedness === 'right') {
        controller.add(input.controllerRight)
        assignController(input, 'controllerRightParent', controller)
        proxifyVector3(XRInputSourceComponent.controllerRightParent.position, entity, controller.position)
        proxifyQuaternion(XRInputSourceComponent.controllerRightParent.quaternion, entity, controller.quaternion)
      }
    })

    // TODO: Handle disconnect event
  })

  controllerGrips.forEach((grip) => {
    grip.addEventListener('connected', function ({ data }) {
      const entity = world.localClientEntity
      const input = getComponent(entity, XRInputSourceComponent)

      if (data.handedness === 'left') {
        grip.add(input.controllerGripLeft)
        assignController(input, 'controllerGripLeftParent', grip)
        proxifyVector3(XRInputSourceComponent.controllerGripLeftParent.position, entity, grip.position)
        proxifyQuaternion(XRInputSourceComponent.controllerGripLeftParent.quaternion, entity, grip.quaternion)
      } else if (data.handedness === 'right') {
        grip.add(input.controllerGripRight)
        assignController(input, 'controllerGripRightParent', grip)
        proxifyVector3(XRInputSourceComponent.controllerGripRightParent.position, entity, grip.position)
        proxifyQuaternion(XRInputSourceComponent.controllerGripRightParent.quaternion, entity, grip.quaternion)
      }
    })

    // TODO: Handle disconnect event
  })

  let eventSent = false

  // TODO: we should unify the logic here and in AvatarSystem xrHandsConnected receptor
  hands.forEach((controller) => {
    controller.addEventListener('connected', ({ data: xrInputSource }) => {
      if (!xrInputSource.hand || controller.userData.mesh) {
        return
      }

      if (!hasComponent(world.localClientEntity, XRHandsInputComponent)) {
        addComponent(world.localClientEntity, XRHandsInputComponent, {
          hands
        })
      }

      initializeHandModel(world.localClientEntity, controller, xrInputSource.handedness)

      if (!eventSent) {
        dispatchAction(WorldNetworkAction.xrHandsConnected({}))
        eventSent = true
      }
    })

    // TODO: Handle disconnect event
  })
}

export const proxifyXRHeadAndContainer = (entity: Entity) => {
  const { head, container } = getComponent(entity, XRInputSourceComponent)
  proxifyVector3(XRInputSourceComponent.head.position, entity, head.position)
  proxifyQuaternion(XRInputSourceComponent.head.quaternion, entity, head.quaternion)
  proxifyVector3(XRInputSourceComponent.container.position, entity, container.position)
  proxifyQuaternion(XRInputSourceComponent.container.quaternion, entity, container.quaternion)
}

export const proxifyXRInputs = (entity: Entity) => {
  const { controllerLeftParent, controllerGripLeftParent, controllerRightParent, controllerGripRightParent } =
    getComponent(entity, XRInputSourceComponent)

  proxifyXRHeadAndContainer(entity)

  proxifyVector3(XRInputSourceComponent.controllerLeftParent.position, entity, controllerLeftParent.position)
  proxifyVector3(XRInputSourceComponent.controllerRightParent.position, entity, controllerRightParent.position)
  proxifyVector3(XRInputSourceComponent.controllerGripLeftParent.position, entity, controllerGripLeftParent.position)
  proxifyVector3(XRInputSourceComponent.controllerGripRightParent.position, entity, controllerGripRightParent.position)
  proxifyQuaternion(XRInputSourceComponent.controllerLeftParent.quaternion, entity, controllerLeftParent.quaternion)
  proxifyQuaternion(XRInputSourceComponent.controllerRightParent.quaternion, entity, controllerRightParent.quaternion)
  proxifyQuaternion(
    XRInputSourceComponent.controllerGripLeftParent.quaternion,
    entity,
    controllerGripLeftParent.quaternion
  )
  proxifyQuaternion(
    XRInputSourceComponent.controllerGripRightParent.quaternion,
    entity,
    controllerGripRightParent.quaternion
  )
}

/**
 * Setup XRInputSourceComponent on entity, required for all input control types
 * @returns XRInputSourceComponentType
 */

export const setupXRInputSourceComponent = (entity: Entity): XRInputSourceComponentType => {
  const container = new Group(),
    head = new Group(),
    controllerLeft = new Group() as ControllerGroup,
    controllerRight = new Group() as ControllerGroup,
    controllerGripLeft = new Group(),
    controllerGripRight = new Group(),
    controllerLeftParent = new Group(),
    controllerGripLeftParent = new Group(),
    controllerRightParent = new Group(),
    controllerGripRightParent = new Group()

  controllerLeftParent.add(controllerLeft)
  controllerRightParent.add(controllerRight)
  controllerGripLeftParent.add(controllerGripLeft)
  controllerGripRightParent.add(controllerGripRight)

  const inputData = {
    head,
    container,
    controllerLeft,
    controllerRight,
    controllerGripLeft,
    controllerGripRight,
    controllerLeftParent,
    controllerGripLeftParent,
    controllerRightParent,
    controllerGripRightParent
  }

  addComponent(entity, XRInputSourceComponent, inputData)
  return inputData
}

export const isInXR = (entity: Entity) => {
  return hasComponent(entity, XRInputSourceComponent)
}

const vec3 = new Vector3()
const v3 = new Vector3()
const uniformScale = new Vector3(1, 1, 1)
const quat = new Quaternion()

/**
 * Gets the hand position in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Vector3}
 */

export const getHandPosition = (entity: Entity, hand: ParityValue = ParityValue.NONE): Vector3 => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  if (xrInputSourceComponent) {
    const rigHand: Object3D =
      hand === ParityValue.LEFT ? xrInputSourceComponent.controllerLeft : xrInputSourceComponent.controllerRight
    if (rigHand) {
      rigHand.updateMatrixWorld(true)
      return rigHand.getWorldPosition(vec3)
    }
  }
  const bone: BoneNames = hand === ParityValue.RIGHT ? 'RightHand' : 'LeftHand'
  const { rig } = getComponent(entity, AvatarAnimationComponent)
  const matWorld = rig[bone].matrixWorld
  return vec3.set(matWorld.elements[12], matWorld.elements[13], matWorld.elements[14])
}

/**
 * Gets the hand rotation in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Quaternion}
 */

export const getHandRotation = (entity: Entity, hand: ParityValue = ParityValue.NONE): Quaternion => {
  const transform = getComponent(entity, TransformComponent)
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  if (xrInputSourceComponent) {
    const rigHand: Object3D =
      hand === ParityValue.LEFT ? xrInputSourceComponent.controllerLeft : xrInputSourceComponent.controllerRight
    if (rigHand) {
      rigHand.updateMatrixWorld(true)
      return rigHand.getWorldQuaternion(quat)
    }
  }
  return quat.copy(transform.rotation).multiply(rotate180onY)
}

/**
 * Gets the hand transform in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns { position: Vector3, rotation: Quaternion }
 */

export const getHandTransform = (
  entity: Entity,
  hand: ParityValue = ParityValue.NONE
): { position: Vector3; rotation: Quaternion } => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  if (xrInputSourceComponent) {
    const rigHand: Object3D =
      hand === ParityValue.LEFT ? xrInputSourceComponent.controllerLeft : xrInputSourceComponent.controllerRight
    if (rigHand) {
      return {
        position: rigHand.getWorldPosition(vec3),
        rotation: rigHand.getWorldQuaternion(quat)
      }
    }
  }
  const bone: BoneNames = hand === ParityValue.RIGHT ? 'RightHand' : 'LeftHand'
  const { rig } = getComponent(entity, AvatarAnimationComponent)
  rig[bone].matrixWorld.decompose(vec3, quat, v3)
  return {
    position: vec3,
    rotation: quat
  }
}
