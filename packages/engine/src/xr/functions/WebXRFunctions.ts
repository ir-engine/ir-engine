import { Engine } from '../../ecs/classes/Engine'
import { Group, Object3D, Quaternion, Vector3 } from 'three'
import { FollowCameraComponent, FollowCameraDefaultValues } from '../../camera/components/FollowCameraComponent'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { Entity } from '../../ecs/classes/Entity'
import { ParityValue } from '../../common/enums/ParityValue'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { XRHandsInputComponent } from '../components/XRHandsInputComponent'
import { initializeHandModel } from './addControllerModels'

const rotate180onY = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI)

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {void}
 */

export const startWebXR = (): void => {
  const controllerLeft = Engine.xrManager.getController(0)
  const controllerRight = Engine.xrManager.getController(1)
  const controllerGripLeft = Engine.xrManager.getControllerGrip(0)
  const controllerGripRight = Engine.xrManager.getControllerGrip(1)
  const container = new Group()

  Engine.scene.remove(Engine.camera)
  container.add(Engine.camera)
  const head = new Group()

  const world = useWorld()

  removeComponent(world.localClientEntity, FollowCameraComponent)

  addComponent(world.localClientEntity, XRInputSourceComponent, {
    head,
    container,
    controllerLeft,
    controllerRight,
    controllerGripLeft,
    controllerGripRight
  })

  bindXRHandEvents()
  dispatchFrom(Engine.userId, () => NetworkWorldAction.setXRMode({ userId: Engine.userId, enabled: true }))
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

  dispatchFrom(Engine.userId, () => NetworkWorldAction.setXRMode({ userId: Engine.userId, enabled: false }))
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
        dispatchFrom(Engine.userId, () => NetworkWorldAction.xrHandsConnected({ userId: Engine.userId }))
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
