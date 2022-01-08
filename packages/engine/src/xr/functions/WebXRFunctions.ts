import { Group, Object3D, Quaternion, Vector3 } from 'three'

import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { FollowCameraComponent, FollowCameraDefaultValues } from '../../camera/components/FollowCameraComponent'
import { ParityValue } from '../../common/enums/ParityValue'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent, XRInputSourceComponentType } from '../../xr/components/XRInputSourceComponent'
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
  const xrm = Engine.xrManager
  const session = xrm.getSession()

  for (let i = 0; i < 2; i++) {
    const j = 1 - i
    const inputSource = session.inputSources[i]
    if (!inputSource) {
      console.log('No xr input source available for index', i)
      continue
    }
    if (inputSource.handedness === 'left') {
      assignControllerAndGrip(xrm, xrInput.controllerLeft, xrInput.controllerGripLeft, i)
      assignControllerAndGrip(xrm, xrInput.controllerRight, xrInput.controllerGripRight, j)
    } else if (inputSource.handedness === 'right') {
      assignControllerAndGrip(xrm, xrInput.controllerLeft, xrInput.controllerGripLeft, j)
      assignControllerAndGrip(xrm, xrInput.controllerRight, xrInput.controllerGripRight, i)
    } else {
      console.warn('Could not determine xr input source handedness', i)
    }
  }
}

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {void}
 */

export const startWebXR = (): void => {
  const container = new Group()

  Engine.scene.remove(Engine.camera)
  container.add(Engine.camera)
  const head = new Group()

  const world = useWorld()

  removeComponent(world.localClientEntity, FollowCameraComponent)

  const inputData = {
    head,
    container,
    controllerLeft: new Group(),
    controllerRight: new Group(),
    controllerGripLeft: new Group(),
    controllerGripRight: new Group()
  }

  // Default mapping
  assignControllerAndGrip(Engine.xrManager, inputData.controllerLeft, inputData.controllerGripLeft, 0)
  assignControllerAndGrip(Engine.xrManager, inputData.controllerRight, inputData.controllerGripRight, 1)

  // Map input sources
  // Sometimes the input sources are not available immidiately
  setTimeout(() => {
    mapXRControllers(inputData)
  }, 1000)

  addComponent(world.localClientEntity, XRInputSourceComponent, inputData)

  bindXRHandEvents()
  dispatchFrom(Engine.userId, () => NetworkWorldAction.setXRMode({ enabled: true })).cache({ removePrevious: true })
}

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {void}
 */

export const endXR = (): void => {
  Engine.xrSession.end()
  Engine.xrSession = null!
  Engine.xrManager.setSession(null)
  Engine.scene.add(Engine.camera)

  addComponent(useWorld().localClientEntity, FollowCameraComponent, FollowCameraDefaultValues)
  removeComponent(useWorld().localClientEntity, XRInputSourceComponent)

  dispatchFrom(Engine.userId, () => NetworkWorldAction.setXRMode({ enabled: false })).cache({ removePrevious: true })
}

/**
 * Initializes XR hand controllers for local client
 * @author Mohsen Heydari <github.com/mohsenheydari>
 * @returns {void}
 */

export const bindXRHandEvents = () => {
  const world = useWorld()
  const hands = [Engine.xrManager.getHand(0), Engine.xrManager.getHand(1)]
  let eventSent = false

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

      initializeHandModel(controller, xrInputSource.handedness)

      if (!eventSent) {
        dispatchFrom(Engine.userId, () => NetworkWorldAction.xrHandsConnected({})).cache({ removePrevious: true })
        eventSent = true
      }
    })
  })
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
  const avatar = getComponent(entity, AvatarComponent)
  const transform = getComponent(entity, TransformComponent)
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  if (xrInputSourceComponent) {
    const rigHand: Object3D =
      hand === ParityValue.LEFT ? xrInputSourceComponent.controllerLeft : xrInputSourceComponent.controllerRight
    if (rigHand) {
      rigHand.updateMatrixWorld(true)
      return rigHand.getWorldPosition(vec3)
    }
  }
  // TODO: replace (-0.5, 0, 0) with animation hand position once new animation rig is in
  return vec3.set(-0.35, 1, 0).applyQuaternion(transform.rotation).add(transform.position)
}

/**
 * Gets the hand rotation in world space
 * @author Josh Field <github.com/HexaField>
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Quaternion}
 */

export const getHandRotation = (entity: Entity, hand: ParityValue = ParityValue.NONE): Quaternion => {
  const avatar = getComponent(entity, AvatarComponent)
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
  const transform = getComponent(entity, TransformComponent)
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
  return {
    // TODO: replace (-0.5, 0, 0) with animation hand position once new animation rig is in
    position: vec3.set(-0.35, 1, 0).applyQuaternion(transform.rotation).add(transform.position),
    rotation: quat.copy(transform.rotation).multiply(rotate180onY)
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
    Engine.camera.matrix.decompose(vec3, quat, v3)
    return {
      position: vec3,
      rotation: quat,
      scale: uniformScale
    }
  }
  const cameraTransform = getComponent(Engine.activeCameraEntity, TransformComponent)
  return {
    position: cameraTransform.position,
    rotation: cameraTransform.rotation,
    scale: uniformScale
  }
}
