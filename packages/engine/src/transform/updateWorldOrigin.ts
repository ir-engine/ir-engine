import { Euler, Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { DualQuaternion } from '../common/classes/DualQuaternion'
import { V_010, V_111 } from '../common/constants/MathConstants'
import { extractRotationAboutAxis } from '../common/functions/MathFunctions'
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
const _euler = new Euler()

const avatarViewerTranslationDeltaDifference = new Vector3()
const avatarViewerRotationDeltaDifference = new Quaternion()

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

  const avatarTransform = getComponent(entity, TransformComponent)
  const originTransform = getComponent(world.originEntity, TransformComponent)

  if (!avatarTransform || !originTransform) {
    xrState.avatarPoseDeltaMetric.update(null)
    return
  }

  xrState.avatarPoseDeltaMetric.update(avatarTransform.position, avatarTransform.rotation)

  if (getControlMode() === 'attached' && xrState.originReferenceSpace && xrState.localFloorReferenceSpace) {
    /** avatar viewer pose delta is the difference bewteen how the viewer has moved relative to the avatar movement since the last webxr frame */
    const viewerPoseDelta = xrState.viewerPoseDeltaMetric.delta
    const avatarPoseDelta = xrState.avatarPoseDeltaMetric.delta
    const originTransform = getComponent(world.originEntity, TransformComponent)

    // get avatar - viewer pose delta difference
    avatarViewerTranslationDeltaDifference.copy(avatarPoseDelta.translation).sub(viewerPoseDelta.translation)
    avatarViewerRotationDeltaDifference.copy(viewerPoseDelta.rotation).invert().multiply(avatarPoseDelta.rotation)

    // shift the world origin by the difference between avatar and viewer movmement
    // originTransform.position.copy(avatarTransform.position)
    originTransform.position.add(avatarViewerTranslationDeltaDifference)

    // originTransform.rotation.multiply(avatarPoseDelta.getRotation(_quat))
    // originTransform.position.sub(avatarViewerPoseDeltaDifference.getTranslation(_vec))
    // const avatarYSpin = extractRotationAboutAxis(avatarViewerRotationDeltaDifference, V_010, _quat)
    // originTransform.rotation.multiply(avatarYSpin)

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
