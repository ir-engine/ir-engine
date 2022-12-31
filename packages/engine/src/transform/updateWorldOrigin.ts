import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { DualQuaternion } from '../common/classes/DualQuaternion'
import { V_111 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { getControlMode, XRState } from '../xr/XRState'
import { TransformComponent } from './components/TransformComponent'

const _vec = new Vector3()
const _quat = new Quaternion()
const _pose = new DualQuaternion()

const avatarViewerPoseDeltaDifference = new DualQuaternion()

/**
 * Updates the world origin entity, effectively moving the world to be in alignment with where the viewer should be seeing it.
 * @param entity
 */
export const updateWorldOriginToAttachedAvatar = (entity: Entity, world: World) => {
  const xrFrame = Engine.instance.xrFrame
  const xrState = getState(XRState).get({ noproxy: true })

  if (!xrFrame || !xrState.localFloorReferenceSpace) {
    xrState.avatarPoseDeltaMetric.update(null)
    return
  }

  const viewerPose = xrFrame.getViewerPose(xrState.localFloorReferenceSpace)
  const avatarTransform = getComponent(entity, TransformComponent)
  const originTransform = getComponent(world.originEntity, TransformComponent)

  if (!viewerPose || !avatarTransform || !originTransform) {
    xrState.avatarPoseDeltaMetric.update(null)
    return
  }

  const avatarPose = _pose.makeFromRotationTranslation(avatarTransform.rotation, avatarTransform.position)
  xrState.avatarPoseDeltaMetric.update(avatarPose)

  if (getControlMode() === 'attached' && xrState.originReferenceSpace && xrState.localFloorReferenceSpace) {
    /** avatar viewer pose delta is the difference bewteen how the viewer has moved relative to the avatar movement since the last webxr frame */
    const viewerPoseDelta = xrState.viewerPoseDeltaMetric.delta
    const avatarPoseDelta = xrState.avatarPoseDeltaMetric.delta
    const originTransform = getComponent(world.originEntity, TransformComponent)
    /** get (avatar - viewer) as a dual quaternion */
    avatarViewerPoseDeltaDifference
      .copy(viewerPoseDelta)
      .prerotate(originTransform.rotation)
      .invert()
      .multiply(avatarPoseDelta)

    // shift the world origin by the difference between avatar and viewer movmement
    originTransform.position.add(avatarViewerPoseDeltaDifference.getTranslation(_vec))
    originTransform.rotation.multiply(avatarViewerPoseDeltaDifference.getRotation(_quat))

    const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
    xrState.originReferenceSpace = xrState.localFloorReferenceSpace.getOffsetReferenceSpace(xrRigidTransform.inverse)
    EngineRenderer.instance.xrManager.setReferenceSpace(xrState.originReferenceSpace)
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
