import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { AvatarRigComponent } from '../avatar/components/AvatarAnimationComponent'
import { V_010, V_111 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { getAvatarHeadLock, getControlMode, XRState } from '../xr/XRState'
import { TransformComponent } from './components/TransformComponent'

const quat = new Quaternion()
const _vec = new Vector3()
const _vec2 = new Vector3()
const quat180y = new Quaternion().setFromAxisAngle(V_010, Math.PI)

/**
 * Updates the world origin entity, effectively moving the world to be in alignment with where the viewer should be seeing it.
 * @param entity
 */
export const updateWorldOriginToAttachedAvatar = (world: World) => {
  const xrState = getState(XRState)
  const viewerPose = Engine.instance.xrFrame?.getViewerPose(xrState.originReferenceSpace.value!)
  const refSpace = xrState.originReferenceSpace.value

  if (getControlMode() === 'attached' && refSpace && viewerPose) {
    const entity = world.localClientEntity
    const avatarTransform = getComponent(entity, TransformComponent)

    const rig = getComponent(entity, AvatarRigComponent)

    const avatarHeadLock = getAvatarHeadLock()

    if (avatarHeadLock && rig) {
      rig.rig.Head.getWorldPosition(_vec)
      _vec.y += 0.14
      _vec.y -= viewerPose.transform.position.y
      const headOffset = _vec2.set(0, 0, 0.1).applyQuaternion(avatarTransform.rotation)
      _vec.add(headOffset)
    } else {
      _vec.copy(avatarTransform.position)
    }

    // rotate 180 degrees as physics looks down +z, and webxr looks down -z
    quat.copy(avatarTransform.rotation).multiply(quat180y)
    const xrRigidTransform = new XRRigidTransform(_vec, quat)
    updateWorldOrigin(
      world,
      _vec.copy(xrRigidTransform.inverse.position as any),
      quat.copy(xrRigidTransform.inverse.orientation as any)
    )
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
