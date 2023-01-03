import { Matrix4, Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { V_010, V_111 } from '../common/constants/MathConstants'
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
export const updateWorldOrigin = (entity: Entity, world: World) => {
  const xrFrame = Engine.instance.xrFrame
  const avatarTransform = getComponent(entity, TransformComponent)
  const originTransform = getComponent(world.originEntity, TransformComponent)
  const avatar = getComponent(entity, AvatarComponent)

  if (!avatarTransform || !originTransform || !xrFrame) return

  const xrState = getState(XRState)

  // viewer pose is relative to the local floor reference space
  const viewerPoseMetrics = xrState.viewerPoseMetrics.value
  const localFloorReferenceSpace = xrState.localFloorReferenceSpace.value

  if (
    getControlMode() === 'attached' &&
    viewerPoseMetrics.position &&
    viewerPoseMetrics.orientation &&
    localFloorReferenceSpace
  ) {
    // compute origin relative to viewer pose
    originTransform.position.copy(viewerPoseMetrics.position)
    originTransform.rotation.copy(viewerPoseMetrics.orientation)
    originTransform.scale.copy(V_111)
    originTransform.matrix.compose(originTransform.position, originTransform.rotation, originTransform.scale).invert()

    // now origin is relative to viewer/avatar; convert back to world space
    avatarHeadMatrix
      .copy(avatarTransform.matrix)
      .multiply(mat.makeRotationFromQuaternion(_rot180).setPosition(0, avatar.avatarHeight * 0.95, 0))
    originTransform.matrix.premultiply(avatarHeadMatrix)
    originTransform.matrix.decompose(originTransform.position, originTransform.rotation, originTransform.scale)
    originTransform.matrixInverse.copy(originTransform.matrix).invert()
    // now origin is relative to world

    // const originTransform = getComponent(world.originEntity, TransformComponent)

    // // get avatar - viewer pose delta difference
    // avatarViewerTranslationDeltaDifference.copy(avatarPoseDelta.translation).sub(viewerPoseDelta.translation)
    // avatarViewerRotationDeltaDifference.copy(viewerPoseDelta.rotation).invert().multiply(avatarPoseDelta.rotation)

    // // shift the world origin by the difference between avatar and viewer movmement
    // // originTransform.position.copy(avatarTransform.position)
    // originTransform.position.add(avatarViewerTranslationDeltaDifference)

    // // originTransform.rotation.multiply(avatarPoseDelta.getRotation(_quat))
    // // originTransform.position.sub(avatarViewerPoseDeltaDifference.getTranslation(_vec))
    // // const avatarYSpin = extractRotationAboutAxis(avatarViewerRotationDeltaDifference, V_010, _quat)
    // // originTransform.rotation.multiply(avatarYSpin)

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
