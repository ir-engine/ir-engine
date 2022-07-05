import { Group, Object3D, Quaternion, Vector3 } from 'three'

import { dispatchAction } from '@xrengine/hyperflux'

import { BoneNames } from '../../avatar/AvatarBoneMatching'
import { AvatarAnimationComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarHeadDecapComponent } from '../../avatar/components/AvatarHeadDecapComponent'
import { accessAvatarInputSettingsState } from '../../avatar/state/AvatarInputSettingsState'
import { ParityValue } from '../../common/enums/ParityValue'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import {
  ControllerGroup,
  XRInputSourceComponent,
  XRInputSourceComponentType
} from '../../xr/components/XRInputSourceComponent'
import { XRHandsInputComponent } from '../components/XRHandsInputComponent'
import { initializeHandModel } from './addControllerModels'

const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

const assignControllerAndGrip = (xrManager, controller, grip, i): void => {
  xrManager.getController(i).add(controller)
  xrManager.getControllerGrip(i).add(grip)
}

/**
 * Map input source controller groups to correct index
 * @author Mohsen Heydari <github.com/mohsenheydari>
 * @param xrInput
 * @returns {void}
 */

export const mapXRControllers = (xrInput: XRInputSourceComponentType): void => {
  const xrm = EngineRenderer.instance.xrManager

  // https://github.com/mrdoob/three.js/blob/0c26bb4bb8220126447c8373154ac045588441de/src/renderers/webxr/WebXRManager.js#L355
  assignControllerAndGrip(xrm, xrInput.controllerLeft, xrInput.controllerGripLeft, 0)
  assignControllerAndGrip(xrm, xrInput.controllerRight, xrInput.controllerGripRight, 1)

  if (xrInput.controllerGripLeft.parent) {
    xrInput.controllerGripLeftParent = xrInput.controllerGripLeft.parent as Group
  }

  if (xrInput.controllerGripRight.parent) {
    xrInput.controllerGripRightParent = xrInput.controllerGripRight.parent as Group
  }

  if (xrInput.controllerLeft.parent) {
    xrInput.controllerLeftParent = xrInput.controllerLeft.parent as Group
  }

  if (xrInput.controllerRight.parent) {
    xrInput.controllerRightParent = xrInput.controllerRight.parent as Group
  }
}

export const proxifyXRInputs = (entity: Entity) => {
  const {
    head,
    container,
    controllerLeftParent,
    controllerGripLeftParent,
    controllerRightParent,
    controllerGripRightParent
  } = getComponent(entity, XRInputSourceComponent)

  proxifyVector3(XRInputSourceComponent.head.position, entity, head.position)
  proxifyQuaternion(XRInputSourceComponent.head.quaternion, entity, head.quaternion)
  proxifyVector3(XRInputSourceComponent.container.position, entity, container.position)
  proxifyQuaternion(XRInputSourceComponent.container.quaternion, entity, container.quaternion)

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

export function setupXRCameraForLocalEntity(entity: Entity) {
  const { container } = getComponent(entity, XRInputSourceComponent)
  container.add(Engine.instance.currentWorld.camera)
  if (!hasComponent(entity, AvatarHeadDecapComponent)) addComponent(entity, AvatarHeadDecapComponent, true)
}

/**
 * Setup XRInputSourceComponent on entity, required for all input control types
 * @author Hamza Mushtaq <github.com/hamzzam>
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

/**
 * Initializes XR controllers for local client
 * @author Hamza Mushtaq <github.com/hamzzam>
 * @returns {void}
 */

export const bindXRControllers = () => {
  const world = Engine.instance.currentWorld
  const xrInputSourceComponent = getComponent(world.localClientEntity, XRInputSourceComponent)

  const inputSourceChanged = (event) => {
    // Map input sources
    mapXRControllers(xrInputSourceComponent)
    // Proxify only after input handedness is determined
    proxifyXRInputs(world.localClientEntity)
    EngineRenderer.instance.xrSession.removeEventListener('inputsourceschange', inputSourceChanged)
  }

  EngineRenderer.instance.xrSession.addEventListener('inputsourceschange', inputSourceChanged)
}

/**
 * Initializes XR hand controllers for local client
 * @author Mohsen Heydari <github.com/mohsenheydari>
 * @coauthor Hamza Mushtaq <github.com/hamzzam>
 * @returns {void}
 */

export const bindXRHandEvents = () => {
  const world = Engine.instance.currentWorld

  const hands = [EngineRenderer.instance.xrManager.getHand(0), EngineRenderer.instance.xrManager.getHand(1)]
  let eventSent = false

  // TODO: we should unify the logic here and in AvatarSystem xrHandsConnected receptor
  hands.forEach((controller: any) => {
    controller.addEventListener('connected', (ev) => {
      const xrInputSource = ev.data

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
        dispatchAction(WorldNetworkAction.xrHandsConnected({}), Engine.instance.currentWorld.worldNetwork.hostId)
        eventSent = true
      }
    })
  })
}

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {void}
 */

export const startWebXR = async (): Promise<void> => {
  const world = Engine.instance.currentWorld
  setupXRInputSourceComponent(world.localClientEntity)
  setupXRCameraForLocalEntity(world.localClientEntity)
  dispatchXRMode(true, accessAvatarInputSettingsState().controlType.value)
  bindXRControllers()
  bindXRHandEvents()
}

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {void}
 */

export const endXR = (): void => {
  // EngineRenderer.instance.xrSession?.end()
  EngineRenderer.instance.xrSession = null!
  EngineRenderer.instance.xrManager.setSession(null!)
  Engine.instance.currentWorld.scene.add(Engine.instance.currentWorld.camera)

  const world = Engine.instance.currentWorld
  removeComponent(world.localClientEntity, XRInputSourceComponent)
  removeComponent(world.localClientEntity, AvatarHeadDecapComponent)
  removeComponent(world.localClientEntity, XRHandsInputComponent)

  dispatchXRMode(false, '')
}

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {boolean}
 */

export const isInXR = (entity: Entity) => {
  return hasComponent(entity, XRInputSourceComponent)
}

const vec3 = new Vector3()
const v3 = new Vector3()
const uniformScale = new Vector3(1, 1, 1)
const quat = new Quaternion()

/**
 * Gets the hand position in world space
 * @author Josh Field <github.com/HexaField>
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
  rig[bone].updateWorldMatrix(true, false)
  const matWorld = rig[bone].matrixWorld
  return vec3.set(matWorld.elements[12], matWorld.elements[13], matWorld.elements[14])
}

/**
 * Gets the hand rotation in world space
 * @author Josh Field <github.com/HexaField>
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
 * @author Josh Field <github.com/HexaField>
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
      rigHand.updateMatrixWorld(true)
      return {
        position: rigHand.getWorldPosition(vec3),
        rotation: rigHand.getWorldQuaternion(quat)
      }
    }
  }
  const bone: BoneNames = hand === ParityValue.RIGHT ? 'RightHand' : 'LeftHand'
  const { rig } = getComponent(entity, AvatarAnimationComponent)
  rig[bone].updateWorldMatrix(true, false)
  rig[bone].matrixWorld.decompose(vec3, quat, v3)
  return {
    position: vec3,
    rotation: quat
  }
}

/**
 * Gets the head transform in world space
 * @author Josh Field <github.com/HexaField>
 * @param entity the player entity
 * @returns { position: Vector3, rotation: Quaternion }
 */

export const getHeadTransform = (entity: Entity): { position: Vector3; rotation: Quaternion; scale: Vector3 } => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  if (xrInputSourceComponent) {
    Engine.instance.currentWorld.camera.matrix.decompose(vec3, quat, v3)
    return {
      position: vec3,
      rotation: quat,
      scale: uniformScale
    }
  }
  const cameraTransform = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent)
  return {
    position: cameraTransform.position,
    rotation: cameraTransform.rotation,
    scale: uniformScale
  }
}

export function dispatchXRMode(enabled: boolean, avatarInputControllerType: string) {
  dispatchAction(
    WorldNetworkAction.setXRMode({
      enabled,
      avatarInputControllerType
    }),
    [Engine.instance.currentWorld.worldNetwork.hostId]
  )
}
