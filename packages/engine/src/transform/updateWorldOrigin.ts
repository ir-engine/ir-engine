import { Matrix4, Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { V_010, V_111 } from '../common/constants/MathConstants'
import { extractRotationAboutAxis } from '../common/functions/MathFunctions'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { getControlMode, XRState } from '../xr/XRState'
import { TransformComponent } from './components/TransformComponent'

const avatarHeadMatrix = new Matrix4()
const mat = new Matrix4()
const _rot180 = new Quaternion().setFromAxisAngle(V_010, Math.PI)

/**
 * Updates the world origin entity, effectively moving the world to be in alignment with where the viewer should be seeing it.
 * @param entity
 */
export const updateWorldOrigin = () => {
  const world = Engine.instance.currentWorld
  const xrFrame = Engine.instance.xrFrame
  const originTransform = getComponent(world.originEntity, TransformComponent)
  const clientTransform = getComponent(world.localClientEntity, TransformComponent)
  const avatar = getComponent(world.localClientEntity, AvatarComponent)

  if (!clientTransform || !originTransform || !xrFrame) return

  const xrState = getState(XRState)

  // viewer pose is relative to the local floor reference space
  const viewerPoseMetrics = xrState.viewerPoseMetrics.value
  const localFloorReferenceSpace = xrState.localFloorReferenceSpace.value
  const viewerReferenceSpace = xrState.viewerReferenceSpace.value

  /**
   * knowns:
   * - where the avatar is in the world - it's final frame (matrix has been computed)
   * - where the viewier is relative to the local floor origin
   * - the relationship between the origin and the viewer
   *   - equivalent to the relationship between the local floor space and the viewer
   * - the cameras transform relative to the origin - should be the same as the viewer relative to the local floor space
   *
   * need to compute:
   * - the camera transform
   *   - the avatar's transform & height
   *   - viewer rotation in world space
   *
   *   - `camera.position = avatar.position + avatarHeight`
   *
   *    // viewer is in world space
   *   - `viewer.rotation = localFloor.rotation * origin.rotation` // OUT ISSUE IS THE AVATAR DOES NOT HAVE COMPLETE ROTATIONAL DATA - ONLY Y AXIS
   *   - `camera.rotation = viewer.rotation`
   *
   *   - `localOrigin = inv(localFloor * viewer)
   *          local origin is the local floor space relative to the viewer
   *
   *   - `worldOrigin = camera * localOrigin`
   */

  if (
    getControlMode() === 'attached' &&
    viewerPoseMetrics.position &&
    viewerPoseMetrics.orientation &&
    localFloorReferenceSpace &&
    viewerReferenceSpace
  ) {
    // compute origin relative to viewer pose
    const originRelativeToViewerPose = xrFrame.getPose(localFloorReferenceSpace, viewerReferenceSpace)
    if (!originRelativeToViewerPose) return

    const localOriginTransform = originTransform
    localOriginTransform.position.copy(originRelativeToViewerPose.transform.position as any)
    localOriginTransform.rotation.copy(originRelativeToViewerPose.transform.orientation as any)
    localOriginTransform.scale.copy(V_111)
    localOriginTransform.matrix.compose(
      localOriginTransform.position,
      localOriginTransform.rotation,
      localOriginTransform.scale
    )

    // compute avatar head matrix
    // viewer in world space
    avatarHeadMatrix.compose(
      new Vector3().copy(clientTransform.position).setY(avatar.avatarHeight * 0.95),
      xrState.viewerWorldRotation.value.clone().invert(),
      V_111
    )

    // convert origin to world space via parent transform (avatarHeadMatrix)
    originTransform.matrix.premultiply(avatarHeadMatrix)
    originTransform.matrix.decompose(originTransform.position, originTransform.rotation, originTransform.scale)

    // now origin is relative to world
    const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
    xrState.originReferenceSpace.set(localFloorReferenceSpace.getOffsetReferenceSpace(xrRigidTransform.inverse))
  }
}

// TODO: only update the world origin in one place; move logic for moving based on viewer hit into the function above
export const updateWorldOriginFromViewerHit = (
  world: World,
  position: Vector3,
  rotation: Quaternion,
  scale?: Vector3
) => {
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
