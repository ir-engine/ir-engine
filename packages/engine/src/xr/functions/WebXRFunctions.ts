import { Engine } from '../../ecs/classes/Engine'
import { Group, Object3D, Quaternion, Vector3 } from 'three'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { Entity } from '../../ecs/classes/Entity'
import { ParityValue } from '../../common/enums/ParityValue'
import { TransformComponent } from '../../transform/components/TransformComponent'

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {Promise<boolean>} returns true on success, otherwise throws error and returns false
 */

export const startXR = (): void => {
  const controllerLeft = Engine.xrRenderer.getController(1) as any
  const controllerRight = Engine.xrRenderer.getController(0) as any
  const controllerGripLeft = Engine.xrRenderer.getControllerGrip(1)
  const controllerGripRight = Engine.xrRenderer.getControllerGrip(0)
  const controllerGroup = new Group()

  Engine.scene.remove(Engine.camera)
  controllerGroup.add(Engine.camera)
  const head = new Group()

  removeComponent(Network.instance.localClientEntity, FollowCameraComponent)

  addComponent(Network.instance.localClientEntity, XRInputSourceComponent, {
    head,
    controllerGroup,
    controllerLeft,
    controllerRight,
    controllerGripLeft,
    controllerGripRight
  })
}

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {void}
 */

export const endXR = (): void => {
  Engine.xrSession.end()
  Engine.xrSession = null
  Engine.scene.add(Engine.camera)
  addComponent(Network.instance.localClientEntity, FollowCameraComponent)
  removeComponent(Network.instance.localClientEntity, XRInputSourceComponent)
}

/**
 * @author Josh Field <github.com/HexaField>
 * @returns {boolean}
 */

export const isInXR = (entity: Entity) => {
  return hasComponent(entity, XRInputSourceComponent)
}

const vec3 = new Vector3()
const quat = new Quaternion()
const forward = new Vector3(0, 0, -1)

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
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  if (xrInputSourceComponent) {
    const rigHand: Object3D =
      hand === ParityValue.LEFT ? xrInputSourceComponent.controllerLeft : xrInputSourceComponent.controllerRight
    if (rigHand) {
      return rigHand.getWorldQuaternion(quat)
    }
  }
  return quat.setFromUnitVectors(forward, avatar.viewVector)
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
  const avatar = getComponent(entity, AvatarComponent)
  const transform = getComponent(entity, TransformComponent)
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
  return {
    // TODO: replace (-0.5, 0, 0) with animation hand position once new animation rig is in
    position: vec3.set(-0.35, 1, 0).applyQuaternion(transform.rotation).add(transform.position),
    rotation: quat.setFromUnitVectors(forward, avatar.viewVector)
  }
}
