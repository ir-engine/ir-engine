import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { V_010, V_111 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { getAvatarHeadLock, getControlMode, XRState } from '../xr/XRState'
import { LocalTransformComponent, TransformComponent } from './components/TransformComponent'

const quat = new Quaternion()
const _vec = new Vector3()
const _vec2 = new Vector3()
const quat180y = new Quaternion().setFromAxisAngle(V_010, Math.PI)

const cameraXZ = new Vector3()
const avatarDifference = new Vector3()
const cameraDifference = new Vector3()
const avatarCameraDifference = new Vector3()
const cameraDrift = new Vector3()

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
    cameraDifference.copy(cameraLocalTransform.position).sub(xrState.previousCameraPosition.value)

    /** avatar differnce is the avatar's world pose delta since the last webxr frame */
    avatarDifference.copy(rigidBody.position).sub(xrState.previousAvatarPosition.value)

    /** avatar camera differnce is the distance the camera has moved relative to the avatar since the last webxr frame */
    avatarCameraDifference.subVectors(avatarDifference, cameraDifference).multiplyScalar(-1)

    /** shift the world origin by the distance the camera has moved relative to the avatar */
    const worldOriginTransform = getComponent(world.originEntity, TransformComponent)
    worldOriginTransform.position.sub(avatarCameraDifference)
  }

  if (hasComponent(entity, RigidBodyComponent)) {
    const rigidBody = getComponent(entity, RigidBodyComponent)
    xrState.previousAvatarPosition.value.copy(rigidBody.position)
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
