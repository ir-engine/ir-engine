import { Quaternion, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { V_111 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { ReferenceSpace, XRState } from '../xr/XRState'
import { TransformComponent } from './components/TransformComponent'
import { computeTransformMatrix } from './systems/TransformSystem'

// TODO: only update the world origin in one place; move logic for moving based on viewer hit into the function above
export const updateWorldOriginFromViewerHit = (
  world: World,
  position: Vector3,
  rotation: Quaternion,
  scale?: Vector3
) => {
  const originTransform = getComponent(world.originEntity, TransformComponent)
  originTransform.position.copy(position)
  originTransform.rotation.copy(rotation)
  originTransform.scale.copy(scale ?? V_111)
  originTransform.matrix.compose(originTransform.position, originTransform.rotation, originTransform.scale)
  originTransform.matrixInverse.copy(originTransform.matrix).invert()
  delete world.dirtyTransforms[world.originEntity]
  const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
  ReferenceSpace.origin = ReferenceSpace.localFloor!.getOffsetReferenceSpace(xrRigidTransform)
}

export const updateWorldOrigin = () => {
  const world = Engine.instance.currentWorld
  if (ReferenceSpace.localFloor) {
    const originTransform = getComponent(world.originEntity, TransformComponent)
    const xrRigidTransform = new XRRigidTransform(originTransform.position, originTransform.rotation)
    ReferenceSpace.origin = ReferenceSpace.localFloor.getOffsetReferenceSpace(xrRigidTransform.inverse)
  }
}

export const computeAndUpdateWorldOrigin = () => {
  const world = Engine.instance.currentWorld
  computeTransformMatrix(world.originEntity, world)
  delete world.dirtyTransforms[world.originEntity]
  updateWorldOrigin()
}

export const updateEyeHeight = () => {
  const xrFrame = Engine.instance.xrFrame
  if (!xrFrame) return
  const viewerPose = xrFrame.getViewerPose(ReferenceSpace.localFloor!)
  if (viewerPose) {
    const xrState = getState(XRState)
    xrState.userEyeLevel.set(viewerPose.transform.position.y)
  }
}
