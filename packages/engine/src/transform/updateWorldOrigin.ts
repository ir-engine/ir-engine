import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { V_010, V_111 } from '../common/constants/MathConstants'
import { extractRotationAboutAxis } from '../common/functions/MathFunctions'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { getAvatarHeadLock, getControlMode, XRState } from '../xr/XRState'
import { LocalTransformComponent, TransformComponent } from './components/TransformComponent'

const _quat = new Quaternion()

const avatarTranslationDifference = new Vector3()
const avatarRotationDifference = new Quaternion()
const cameraTranslationDifference = new Vector3()
const cameraRotationDifference = new Quaternion()
const avatarCameraTranslationDifference = new Vector3()
const avatarCameraRotationDifference = new Quaternion()
const avatarYRotation = new Quaternion()
const cameraYRotation = new Quaternion()

/**
 * Updates the world origin entity, effectively moving the world to be in alignment with where the viewer should be seeing it.
 * @param entity
 */
export const updateWorldOriginToAttachedAvatar = (entity: Entity, world: World) => {
  const xrState = getState(XRState)
  const viewerPose = Engine.instance.xrFrame?.getViewerPose(xrState.originReferenceSpace.value!)
  const refSpace = xrState.originReferenceSpace.value

  if (getControlMode() === 'attached' && refSpace && viewerPose) {
    const rigidBody = getComponent(entity, RigidBodyComponent)

    /** camera difference is the local pose delta since the last webxr frame */
    const cameraLocalTransform = getComponent(world.cameraEntity, LocalTransformComponent)
    // cameraAvatarDifference.copy(rigidBody.position)
    cameraTranslationDifference.copy(cameraLocalTransform.position).sub(xrState.previousCameraPosition.value)
    cameraRotationDifference
      .copy(_quat.copy(xrState.previousCameraRotation.value).invert())
      .multiply(cameraLocalTransform.rotation)

    /** avatar differnce is the avatar's world pose delta since the last webxr frame */
    avatarTranslationDifference.copy(rigidBody.position).sub(xrState.previousAvatarPosition.value)
    avatarRotationDifference
      .copy(_quat.copy(xrState.previousAvatarRotation.value).invert())
      .multiply(rigidBody.rotation)

    /** avatar camera differnce is the distance the camera has moved relative to the avatar since the last webxr frame */
    avatarCameraTranslationDifference.subVectors(avatarTranslationDifference, cameraTranslationDifference)
    // avatarCameraRotationDifference.multiplyQuaternions(cameraRotationDifference.invert(), avatarRotationDifference)

    extractRotationAboutAxis(rigidBody.rotation, V_010, avatarYRotation)
    extractRotationAboutAxis(cameraLocalTransform.rotation, V_010, cameraYRotation)

    avatarCameraRotationDifference.multiplyQuaternions(cameraYRotation.invert(), avatarYRotation)

    /** shift the world origin by the distance the camera has moved relative to the avatar */
    const worldOriginTransform = getComponent(world.originEntity, TransformComponent)
    worldOriginTransform.position.add(avatarCameraTranslationDifference)
    worldOriginTransform.rotation.multiply(avatarCameraRotationDifference)
  }

  if (hasComponent(entity, RigidBodyComponent)) {
    const rigidBody = getComponent(entity, RigidBodyComponent)
    xrState.previousAvatarPosition.value.copy(rigidBody.position)
    xrState.previousAvatarRotation.value.copy(rigidBody.rotation)
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
