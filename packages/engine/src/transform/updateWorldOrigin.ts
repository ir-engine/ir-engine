import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { V_111 } from '../common/constants/MathConstants'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { getControlMode, XRState } from '../xr/XRState'
import { TransformComponent } from './components/TransformComponent'

const _quat = new Quaternion()

const avatarTranslationDifference = new Vector3()
const avatarRotationDifference = new Quaternion()
const cameraTranslationDifference = new Vector3()
const cameraRotationDifference = new Quaternion()
const avatarCameraTranslationDifference = new Vector3()
const avatarCameraRotationDifference = new Quaternion()

/**
 * Updates the world origin entity, effectively moving the world to be in alignment with where the viewer should be seeing it.
 * @param entity
 */
export const updateWorldOriginToAttachedAvatar = (entity: Entity, world: World) => {
  const xrState = getState(XRState).get({ noproxy: true })

  if (getControlMode() === 'attached' && xrState.originReferenceSpace && xrState.localFloorReferenceSpace) {
    const rigidBody = getComponent(entity, RigidBodyComponent)

    /** camera difference is the local pose delta since the last webxr frame */
    const cameraTransform = getComponent(world.cameraEntity, TransformComponent)
    // cameraAvatarDifference.copy(rigidBody.position)
    cameraTranslationDifference.copy(cameraTransform.position).sub(xrState.previousCameraPosition)
    cameraRotationDifference
      .copy(_quat.copy(xrState.previousCameraRotation).invert())
      .multiply(cameraTransform.rotation)

    /** avatar differnce is the avatar's world pose delta since the last webxr frame */
    avatarTranslationDifference.copy(rigidBody.position).sub(xrState.previousAvatarPosition)
    avatarRotationDifference.copy(_quat.copy(xrState.previousAvatarRotation).invert()).multiply(rigidBody.rotation)

    /** avatar camera differnce is the distance the camera has moved relative to the avatar since the last webxr frame */
    avatarCameraTranslationDifference.subVectors(avatarTranslationDifference, cameraTranslationDifference)
    avatarCameraRotationDifference.multiplyQuaternions(cameraRotationDifference.invert(), avatarRotationDifference)

    // extractRotationAboutAxis(rigidBody.rotation, V_010, avatarYRotation)
    // extractRotationAboutAxis(cameraLocalTransform.rotation, V_010, cameraYRotation)

    // avatarCameraRotationDifference.multiplyQuaternions(cameraYRotation.invert(), avatarYRotation)

    /** shift the world origin by the distance the camera has moved relative to the avatar */
    const originTransform = getComponent(world.originEntity, TransformComponent)
    originTransform.position.add(avatarCameraTranslationDifference)
    // originTransform.rotation.multiply(avatarCameraRotationDifference)

    const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
    xrState.originReferenceSpace = xrState.localFloorReferenceSpace.getOffsetReferenceSpace(xrRigidTransform.inverse)
  }

  if (hasComponent(entity, RigidBodyComponent)) {
    const rigidBody = getComponent(entity, RigidBodyComponent)
    xrState.previousAvatarPosition.copy(rigidBody.position)
    xrState.previousAvatarRotation.copy(rigidBody.rotation)
  }
}

/**
 * Sets the world origin
 * @param world
 * @param position
 * @param rotation
 * @param scale
 */
export const updateWorldOrigin = (world: World, position: Vector3, rotation: Quaternion, scale?: Vector3) => {
  const worldOriginTransform = getComponent(world.originEntity, TransformComponent)
  worldOriginTransform.matrix.compose(position, rotation, V_111)
  worldOriginTransform.matrix.invert()
  if (scale) worldOriginTransform.matrix.scale(scale)
  worldOriginTransform.matrix.decompose(
    worldOriginTransform.position,
    worldOriginTransform.rotation,
    worldOriginTransform.scale
  )
}
